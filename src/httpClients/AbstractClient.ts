import { HttpClientInterface } from '../interfaces';

export default abstract class AbstractClient implements HttpClientInterface {
	protected url: string;
	protected headers: Headers;

	abstract get(): Promise<Response>;

	abstract post(): Promise<Response>;

	abstract put(): Promise<Response>;

	abstract delete(): Promise<Response>;

	abstract head(): Promise<Response>;

	protected generateFullHeaders(headers?: { [key: string]: string }): Headers {
		const fullRequestHeaders = this.headers;
		if (headers) {
			Object.entries(headers).forEach((entry) => {
				const [headerName, headerValue] = entry;
				fullRequestHeaders.set(headerName, headerValue);
			});
		}
		return fullRequestHeaders;
	}

	protected generateRequestBodyString(body: {} | string): string {
		let result;
		if (body) {
			if (typeof body === 'string') {
				result = body;
			} else {
				result = JSON.stringify(body);
			}
		} else {
			result = '';
		}
		return result;
	}

	protected catchHTTPResponseError(res: Response): Promise<Response> {
		return new Promise(
			(resolve, reject) => {
						res.ok
							? resolve(res)
							: reject(res);
			}
		);
	}
}
