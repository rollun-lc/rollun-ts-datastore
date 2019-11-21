import Query                     from 'rollun-ts-rql/dist/Query';
import Limit                     from 'rollun-ts-rql/dist/nodes/Limit';
import Select                    from 'rollun-ts-rql/dist/nodes/Select';
import Sort                      from 'rollun-ts-rql/dist/nodes/Sort';
import AbstractQueryNode         from 'rollun-ts-rql/dist/nodes/AbstractQueryNode';
import AbstractLogicalNode       from 'rollun-ts-rql/dist/nodes/logicalNodes/AbstractLogicalNode';
import AggregateFunctionNode     from 'rollun-ts-rql/dist/nodes/aggregateNodes/AggregateFunctionNode';
import { LocalDataStoreOptions } from '../LocalDatastore';
import _                         from 'lodash/fp';
import {
	queryNodeHandlerFactory,
	logicalNodesHandlersFactory
}                                from './QueryNodeHandlerFactory';

/**
 * T extends {[key: string]: any}, this string exists to silence ts error 'type {} has no index signature'
 */

export default class LocalDataClient<T extends {[key: string]: any}> {
	readonly identifier: string;
	private data: Array<T>;

	constructor(options?: LocalDataStoreOptions<T>) {
		this.data = (options && options.initialData) || [];
		this.identifier = (options && options.idField) || 'id';
	}

	getDataLength(): number {
		return this.data.length;
	}

	delete(id: string | number) {
		let removedItem = null;
		this.data = this.data.filter(el => {
			if (el[this.identifier] === id) {
				removedItem = el;
				return false;
			}
			return true;
		});
		if (!removedItem) {
			throw new Error(`Could not find item with key identifier ${id} to delete`);
		}
		return removedItem;
	}

	read(id: string | number): T | undefined {
		return this.data.find(el => el[this.identifier] === id);
	}

	get<U = T>(query?: Query): Array<U> {
		if (!query) {
			return this.data as unknown as Array<U>;
		}
		return _.compose(
			this._getLimitHandler(query.limitNode),
			this._getSelectHandler(query.selectNode),
			this._getSortHandler(query.sortNode),

			this._getQueryHandler(query.queryNode)
		)(this.data) as unknown as Array<U>;
	}

	update<U extends {[key: string]: any}>(item: U): T {
		const id = item[this.identifier];
		if (!id) {
			throw new TypeError(`Item does not have key identifier [${this.identifier}]`);
		}
		let updatedItem = null;
		this.data = this.data.map((el: T): T => {
			if (el[this.identifier] === id) {
				updatedItem = {...el, ...item};
				return updatedItem;
			}
			return el;
		});
		if (updatedItem) {
			return updatedItem;
		}
		throw new Error(`Could not find item with key identifier ${id} to update`);
	}

	create(item: T): T {
		const id = item[this.identifier];
		if (!id) {
			throw new Error('Item does not have key identifier');
		}
		const existingItem = this.data.find(el => el[this.identifier] === id);
		if (existingItem) {
			throw new Error(`Item with key identifier ${id} already exists`);
		}
		this.data = this.data.concat(item);
		return item;
	}

	private _getSortHandler(node?: Sort) {
		if (!node) { return (data: Array<T>) => data; }
		return (data: Array<T>) => data.sort((a, b) => {
			const sortOptions = Object.entries(node!.sortOptions);
			for (const sortOption of sortOptions) {
				const [key, value] = sortOption;
				if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
					throw new Error(`Field ${key} does not exist in list`);
				}
				if (a[key] > b[key]) {
					return 1 * value;
				} else if (a[key] < b[key]) {
					return -1 * value;
				}
			}
			return 0;
		});
	}

	private _getLimitHandler(node?: Limit) {
		if (!node) { return (data: Array<T>) => data; }
		return (data: Array<T>) => data.slice(node.offset, node.offset + node.limit);
	}

	private _getSelectHandler(node?: Select) {
		if (!node) { return (data: Array<T>) => data; }
		return (data: Array<T>) => data.map(el => {
			let newItem: {[key: string]: any} = {};
			node.fields.forEach(field => {
				if (field instanceof AggregateFunctionNode) {
					// TODO aggregation nodes support
				} else {
					if (el.hasOwnProperty(field)) {
						newItem[field] = el[field];
					} else {
						throw new Error(`Field ${field} does not exist in list`);
					}
				}
			});
			return newItem;
		});
	}

	private _getItemHandlerRecursively(node: AbstractQueryNode) {
		if (node instanceof AbstractLogicalNode) {
			let handlers = new Array(node.subNodes.length);
			for (let i = 0; i < node.subNodes.length; i++) {
				handlers[i] = this._getItemHandlerRecursively(node.subNodes[i]);
			}
			return logicalNodesHandlersFactory(node)(handlers);
		} else {
			return queryNodeHandlerFactory(node);
		}
	}

	private _getQueryHandler(node?: AbstractQueryNode) {
		// console.log('query', node);
		if (!node) { return (data: Array<T>) => data; }
		// console.log(node);
		const handler = this._getItemHandlerRecursively(node);
		// console.log(handler);
		return (data: Array<T>) => data.filter(handler);
	}
}
