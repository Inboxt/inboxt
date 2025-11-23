export function LogExecutionTime(
	_target: any,
	propertyKey: string,
	descriptor: PropertyDescriptor,
) {
	const originalMethod = descriptor.value;

	descriptor.value = async function (...args: any[]) {
		const startTime = Date.now();
		const methodName = propertyKey.replace(/([A-Z])/g, ' $1').toLowerCase();

		try {
			const result = await originalMethod.apply(this, args);
			const executionTime = Date.now() - startTime;

			this.logger.log(`${methodName} completed in ${executionTime}ms`);
			return result;
		} catch (error) {
			(error as any).executionTime = Date.now() - startTime;
			throw error;
		}
	};

	return descriptor;
}
