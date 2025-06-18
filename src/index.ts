import {Retries} from "durable-utils";

export type Env = {
    DB01: D1Database;
};

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);

        const bookmark =
            request.headers.get("x-d1-bookmark") ?? "first-unconstrained";
        const session = env.DB01.withSession(bookmark);

        try {
            // Use this Session for all our Workers' routes.
            const response = await withTablesInitialized(
                request,
                session,
                handleRequest,
            );

            // B. Return the bookmark so we can continue the Session in another request.
            response.headers.set("x-d1-bookmark", session.getBookmark() ?? "");

            return response;
        } catch (e) {
            console.error({
                message: "Failed to handle request",
                error: String(e),
                errorProps: e,
                url,
                bookmark,
            });
            return Response.json(
                {error: String(e), errorDetails: e},
                {status: 500},
            );
        }
    },
} satisfies ExportedHandler<Env>;

type User = {
    id: number;
    name: string;
    age: number;
    email: string;
    mobile: string;
    balance: number;
    is_active: number;
};

async function handleRequest(request: Request, session: D1DatabaseSession) {
    const {pathname} = new URL(request.url);
    const { searchParams } = new URL(request.url);

    const tsStart = Date.now();

    if (request.method === "GET" && pathname === "/api/user") {
        const page = searchParams.get('page') || 0;
        const size = searchParams.get('size') || 10;
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const mobile = searchParams.get('mobile');
        
        // Build WHERE conditions based on provided parameters
        let whereClause = '';
        const conditions = [];
        if (name) conditions.push(`name = '${name}'`);
        if (email) conditions.push(`email = '${email}'`);
        if (mobile) conditions.push(`mobile = '${mobile}'`);
        
        if (conditions.length > 0) {
            whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
        //分页
        const offset = (Number(page) - 1) * Number(size);
        // C. Session read query.
        return await Retries.tryWhile(async () => {
            const resp = await session.prepare(`select * from t_user ${whereClause} order by id limit ${size} offset ${offset}`).all();
            return Response.json(buildResponse(session, resp, tsStart));
        }, shouldRetry);
    } else if (request.method === "POST" && pathname === "/api/user") {
        return Response.json(await request.json<User>());
    }
    return new Response("Not found", {status: 404});
}

function buildResponse(
    session: D1DatabaseSession,
    res: D1Result,
    tsStart: number,
) {
    return {
        d1Latency: Date.now() - tsStart,

        results: res.results,
        servedByRegion: res.meta.served_by_region ?? "",
        servedByPrimary: res.meta.served_by_primary ?? "",

        // Add the session bookmark inside the response body too.
        sessionBookmark: session.getBookmark(),
    };
}

function shouldRetry(err: unknown, nextAttempt: number) {
    const errMsg = String(err);
    const isRetryableError =
        errMsg.includes("Network connection lost") ||
        errMsg.includes("storage caused object to be reset") ||
        errMsg.includes("reset because its code was updated");
    return nextAttempt <= 5 && isRetryableError;

}

/**
 * This is mostly for DEMO purposes to avoid having to do separate schema migrations step.
 * This will check if the error is because our main table is missing, and if it is create the table
 * and rerun the handler.
 */
async function withTablesInitialized(
    request: Request,
    session: D1DatabaseSession,
    handler: (request: Request, session: D1DatabaseSession) => Promise<Response>,
) {
    // We use clones of the body since if we parse it once, and then retry with the
    // same request, it will fail due to the body stream already being consumed.
    try {
        return await handler(request.clone(), session);
    } catch (e) {
        if (String(e).includes("no such table: User: SQLITE_ERROR")) {
            return await handler(request.clone(), session);
        }
        throw e;
    }
}

