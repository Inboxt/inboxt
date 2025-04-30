export interface CorsConfig {
	enabled: boolean;
}

export interface GraphqlConfig {
	autoSchemaFile: boolean;
	sortSchema: boolean;
	graphiql: boolean;
}

export interface SecurityConfig {
	jwtSecret: string;
	expiresIn: string;
}

export interface Config {
	cors: CorsConfig;
	graphql: GraphqlConfig;
	security: SecurityConfig;
}
