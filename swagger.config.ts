import swaggerJsdoc from "swagger-jsdoc";
 
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ant-api",
      version: "1.0.0",
      description: "Messenger backend — auth, chats, groups, messages, search.",
    },
    servers: [
      { url: "https://server.com", description: "production" },
      { url: "http://localhost:3001", description: "localhost" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.ts"],
});
 
export default swaggerSpec;
