import { defineConfig } from "prisma/config";
export default defineConfig({
    schema: "./schema.prisma",
    migrations: {
        path: "./migrations",
    },
});
//# sourceMappingURL=prisma.config.js.map