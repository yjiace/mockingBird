import { Hono } from 'hono';
import { Retries } from "durable-utils";

export type Env = {
    DB01: D1Database;
};

type CustomContext = {
    session: D1DatabaseSession;
};

const app = new Hono<{ Bindings: Env; Variables: CustomContext }>();

type User = {
    id: number;
    name: string;
    age: number;
    email: string;
    mobile: string;
    balance: number;
    is_active: number;
    address: Address | null;
};

type Address = {
    id: number;
    province: string;
    city: string;
    district: string;
    street: string;
    user_id: string;
};

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

// SSE 响应工具函数
function createSseResponse(data: any): Response {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            controller.close();
        }
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}

// 智能响应函数，自动判断SSE或JSON
function smartResponse(c: any, data: any, statusCode: number = 200, message: string = 'success') {
    const isSse = c.req.header('accept')?.includes('text/event-stream');
    if (isSse) {
        return createSseResponse({ code: statusCode, message, data });
    } else {
        return createJsonResponse(data, statusCode, message);
    }
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
    if (name && name.trim() !== '') conditions.push(`name = '${name}'`);
    if (email && email.trim() !== '') conditions.push(`email = '${email}'`);
    if (mobile && mobile.trim() !== '') conditions.push(`mobile = '${mobile}'`);
    
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
                return smartResponse(c, {
                    results: [],
                    total: total,
                    page: pageNum,
                    size: sizeNum,
                });
            }
            
            const resp = await session
                .prepare(`select * from t_user ${whereClause} order by id limit ${sizeNum} offset ${offset}`).all();

            const  results = resp.results as User[];
            const addressResults = await session
                .prepare(`select * from t_address where user_id in (${results.map(result => result.id).join(',')})`).all();
            const addresses = addressResults.results as Address[];

            // 2. 构建 user_id 到 address 的映射
            const addressMap: Record<string, Address> = {};
            for (const addr of addresses) {
                addressMap[addr.user_id] = addr;
            }

            // 3. 给每个用户加上 address 字段
            for (const user of results) {
                user.address = addressMap[user.id] ?? null;
            }

            return smartResponse(c, {
                results: results,
                total: total,
                page: pageNum,
                size: sizeNum,
            });
        }, shouldRetry);
    });
});

// GET /api/user/:id - 获取单个用户信息
app.get('/api/user/:id', async (c) => {
    const session = c.get('session');
    const userId = c.req.param('id');

    return await withTablesInitialized(session, async (session) => {
        return await Retries.tryWhile(async () => {
            // 查询用户
            const user = await session.prepare(`SELECT * FROM t_user WHERE id = ? LIMIT 1`).bind(userId).first<User>();
            if (!user) {
                return smartResponse(c, null, 404, "User not found");
            }
            // 查询地址
            const address = await session
                .prepare(`SELECT * FROM t_address WHERE user_id = ? LIMIT 1`).bind(user.id).first<Address>();
            user.address = address ?? null;
            return smartResponse(c, user);
        }, shouldRetry);
    });
});

// POST /api/user - 创建用户
app.post('/api/user', async (c) => {
    const session = c.get('session');
    const requestData = await c.req.json<User>();

    return await withTablesInitialized(session, async (session) => {
        return smartResponse(c, {
            ...requestData,
            id: Date.now(), // 模拟生成的ID
            message: 'User created successfully'
        });
    });
});

// PUT /api/user - 更新用户资料
app.put('/api/user/:id', async (c) => {
    const session = c.get('session');
    const requestData = await c.req.json<User>();
    const userId = c.req.param('id');
    requestData.id = parseInt(userId ?? requestData.id);
    return await withTablesInitialized(session, async (session) => {
        // 查询用户
        const user = await session.prepare(`SELECT * FROM t_user WHERE id = ? LIMIT 1`).bind(requestData.id).first<User>();
        if (!user) {
            return smartResponse(c, null, 404, "User not found");
        }
        // 合并 user 和 requestData，以 requestData 为准
        const mergedUser = { ...user, ...requestData };
        return smartResponse(c, {
            ...mergedUser,
            message: 'User updated successfully'
        });
    });
});

// PATCH /api/user - 部分更新指定用户的信息
app.patch('/api/user/:id', async (c) => {
    const session = c.get('session');
    const requestData = await c.req.json<User>();
    const userId = c.req.param('id');
    requestData.id = parseInt(userId ?? requestData.id);

    return await withTablesInitialized(session, async (session) => {
        // 查询用户
        const user = await session.prepare(`SELECT * FROM t_user WHERE id = ? LIMIT 1`).bind(requestData.id).first<User>();
        if (!user) {
            return smartResponse(c, null, 404, "User not found");
        }
        // 合并 user 和 requestData，以 requestData 为准
        const mergedUser = { ...user, ...requestData };
        return smartResponse(c, {
            ...mergedUser,
            message: 'User updated successfully'
        });
    });
});

// DELETE /api/user/:id - 删除用户
app.delete('/api/user/:id', async (c) => {
    const session = c.get('session');
    const userId = c.req.param('id');
    
    return await withTablesInitialized(session, async (session) => {
        // 查询用户
        const user = await session.prepare(`SELECT * FROM t_user WHERE id = ? LIMIT 1`).bind(userId).first<User>();
        if (!user) {
            return smartResponse(c, null, 404, "User not found");
        }
        return smartResponse(c, {
            message: `User ${userId} deleted successfully`
        });
    });
});

// 文件上传接口
app.post('/api/upload', async (c) => {
    const contentType = c.req.header('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
        return smartResponse(c, null, 400, 'Content-Type must be multipart/form-data');
    }
    // 解析 multipart/form-data
    const formData = await c.req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
        return smartResponse(c, null, 400, 'No file uploaded');
    }
    // file: File 类型
    const { name, type, size } = file;
    // 读取文件内容为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // 计算 md5
    const hashBuffer = await crypto.subtle.digest('MD5', arrayBuffer);
    // 转为16进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const md5 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return smartResponse(c, {
        name,
        type,
        size,
        md5
    });
});

// 文件ID到文件路径和文件名的映射（实际可替换为数据库）
const fileMap: Record<string, { path: string, name: string }> = {
    "1": { path: "test.png", name: "测试图片.png" },
    "2": { path: "demo.pdf", name: "演示文档.pdf" },
    // 可继续添加
};

// 通过ID下载文件接口
app.get('/api/download', async (c) => {
    const id = c.req.query('id');
    if (!id || !fileMap[id]) {
        return smartResponse(c, null, 404, 'File not found');
    }
    const { path, name } = fileMap[id];
    // 防止非法路径
    if (!path || path.includes('..') || path.startsWith('/')) {
        return smartResponse(c, null, 400, 'Invalid file path');
    }
    // 读取文件内容
    // @ts-ignore
    const file = await __STATIC_CONTENT.get(`files/${path}`);
    if (!file) {
        return smartResponse(c, null, 404, 'File not found');
    }
    // 设置 Content-Type
    const ext = path.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'png': 'image/png',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'ico': 'image/x-icon',
        'js': 'application/javascript',
        'css': 'text/css',
        'woff2': 'font/woff2',
        'json': 'application/json',
        'html': 'text/html',
        'svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
    const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`
    };
    return new Response(file, { status: 200, headers });
});

// 404 处理
app.notFound((c) => {
    return smartResponse(c, null, 404, "Not found");
});

// 导出 Cloudflare Workers 处理器
export default app;

