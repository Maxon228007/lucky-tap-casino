type SqlJsDatabase = any;
export declare function initDb(): Promise<SqlJsDatabase>;
export declare function saveDb(): void;
export declare function getDb(): SqlJsDatabase;
export declare function closeDb(): void;
export declare function queryOne<T = any>(sql: string, params?: any[]): T | null;
export declare function queryAll<T = any>(sql: string, params?: any[]): T[];
export declare function runQuery(sql: string, params?: any[]): {
    changes: number;
    lastInsertRowid: number;
};
export {};
