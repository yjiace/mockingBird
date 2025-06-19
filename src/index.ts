import { Hono } from 'hono';
import { Retries } from "durable-utils";

export type Env = {
    DB01: D1Database;
};

// 定义自定义上下文类型
type CustomContext = {
    session: D1DatabaseSession;
};

// 创建 Hono 应用实例
const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

type User = {
    id: number;
    name: string;
    age: number;
    email: string;
    mobile: string;
    balance: number;
    is_active: number;
};

// Helper function to create standardized JSON responses
function createJsonResponse(data: any, statusCode: number = 200, message: string = "success"): Response {
    return Response.json(
        {
            code: statusCode,
            message: message,
            data: data,
        },
        { status: statusCode }
    );
}

// 中间件：初始化数据库会话
app.use('*', async (c, next) => {
    const bookmark = c.req.header("x-d1-bookmark") ?? "first-unconstrained";
    const session = c.env.DB01.withSession(bookmark);
    
    // 将会话添加到上下文中
    c.set('session', session);
    
    await next();
    
    // 设置响应头
    c.header("x-d1-bookmark", session.getBookmark() ?? "");
});

// 中间件：错误处理
app.onError((err, c) => {
    console.error({
        message: "Failed to handle request",
        error: String(err),
        errorProps: err,
        url: c.req.url,
    });
    
    return createJsonResponse(
        { error: String(err), errorDetails: err },
        500
    );
});

// 中间件：数据库表初始化
async function withTablesInitialized(
    session: D1DatabaseSession,
    handler: (session: D1DatabaseSession) => Promise<Response>,
) {
    try {
        return await handler(session);
    } catch (e) {
        if (String(e).includes("no such table: User: SQLITE_ERROR")) {
            return await handler(session);
        }
        throw e;
    }
}

function shouldRetry(err: unknown, nextAttempt: number) {
    const errMsg = String(err);
    const isRetryableError =
        errMsg.includes("Network connection lost") ||
        errMsg.includes("storage caused object to be reset") ||
        errMsg.includes("reset because its code was updated");
    return nextAttempt <= 5 && isRetryableError;
}

// 路由定义

// GET /api/user - 获取用户列表
app.get('/api/user', async (c) => {
    const session = c.get('session');
    const { page = '1', size = '10', name, email, mobile } = c.req.query();
    
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    
    // Build WHERE conditions based on provided parameters
    let whereClause = '';
    const conditions = [];
    if (name) conditions.push(`name = '${name}'`);
    if (email) conditions.push(`email = '${email}'`);
    if (mobile) conditions.push(`mobile = '${mobile}'`);
    
    if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    // 分页
    const offset = (pageNum - 1) * sizeNum;
    
    return await withTablesInitialized(session, async (session) => {
        return await Retries.tryWhile(async () => {
            const totalResult = await session.prepare(`SELECT COUNT(*) as total FROM t_user ${whereClause}`).first<{ total: number }>();
            const total = totalResult?.total || 0;
    
            if (total === 0) {
                return createJsonResponse({
                    results: [],
                    total: total,
                    page: pageNum,
                    size: sizeNum,
                });
            }
            
            const resp = await session
                .prepare(`select * from t_user ${whereClause} order by id limit ${sizeNum} offset ${offset}`).all();
            
            return createJsonResponse({
                results: resp.results,
                total: total,
                page: pageNum,
                size: sizeNum,
            });
        }, shouldRetry);
    });
});

// POST /api/user - 创建用户
app.post('/api/user', async (c) => {
    const session = c.get('session');
    const requestData = await c.req.json<User>();
    
    return await withTablesInitialized(session, async (session) => {
        // 这里可以添加实际的数据库插入逻辑
        console.log('Creating new user:', requestData);
        
        return createJsonResponse({
            ...requestData,
            id: Date.now(), // 模拟生成的ID
            message: 'User created successfully'
        });
    });
});

// GET /api/user/:id - 获取单个用户
app.get('/api/user/:id', async (c) => {
    const session = c.get('session');
    const userId = c.req.param('id');
    
    return await withTablesInitialized(session, async (session) => {
        // 这里可以添加实际的数据库查询逻辑
        console.log(`Getting user with ID: ${userId}`);
        
        // 模拟返回用户数据
        const mockUser: User = {
            id: parseInt(userId),
            name: "John Doe",
            age: 30,
            email: "john@example.com",
            mobile: "1234567890",
            balance: 1000,
            is_active: 1
        };
        
        return createJsonResponse(mockUser);
    });
});

// PUT /api/user/:id - 更新用户
app.put('/api/user/:id', async (c) => {
    const session = c.get('session');
    const userId = c.req.param('id');
    const requestData = await c.req.json<User>();
    
    return await withTablesInitialized(session, async (session) => {
        // 这里可以添加实际的数据库更新逻辑
        console.log(`Updating user with ID: ${userId}`, requestData);
        
        return createJsonResponse({
            ...requestData,
            id: userId,
            message: `User ${userId} updated successfully`
        });
    });
});

// DELETE /api/user/:id - 删除用户
app.delete('/api/user/:id', async (c) => {
    const session = c.get('session');
    const userId = c.req.param('id');
    
    return await withTablesInitialized(session, async (session) => {
        // 这里可以添加实际的数据库删除逻辑
        console.log(`Deleting user with ID: ${userId}`);
        
        return createJsonResponse({
            message: `User ${userId} deleted successfully`
        });
    });
});

// 404 处理
app.notFound((c) => {
    return createJsonResponse(null, 404, "Not found");
});

// 导出 Cloudflare Workers 处理器
export default app;

