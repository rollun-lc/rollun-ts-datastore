import _ from 'lodash';

import AbstractQueryNode   from 'rollun-ts-rql/dist/nodes/AbstractQueryNode';
import AbstractLogicalNode from 'rollun-ts-rql/dist/nodes/logicalNodes/AbstractLogicalNode';
import AbstractScalarNode  from 'rollun-ts-rql/dist/nodes/scalarNodes/AbstractScalarNode';
import AbstractArrayNode   from 'rollun-ts-rql/dist/nodes/arrayNodes/AbstractArrayNode';

import And                   from 'rollun-ts-rql/dist/nodes/logicalNodes/And';
import Or                    from 'rollun-ts-rql/dist/nodes/logicalNodes/Or';
import AggregateFunctionNode from 'rollun-ts-rql/dist/nodes/aggregateNodes/AggregateFunctionNode';

export const logicalNodesHandlersFactory = (node: AbstractLogicalNode) => {
	if (node instanceof And) {
		return (handlers: Array<(item) => boolean>) => {
			return item => handlers.every(handler => handler(item));
		};
	} else if (node instanceof Or) {
		return (handlers: Array<(item) => boolean>) => {
			return item => handlers.some(handler => handler(item));
		};
	} else {
		// Stub for Not node
		return () => () => true;
	}
};

const nodesMap = {
	eq:       (a, b) => a === b,
	ne:       (a, b) => a !== b,
	le:       (a, b) => a <= b,
	lt:       (a, b) => a < b,
	ge:       (a, b) => a >= b,
	gt:       (a, b) => a > b,
	like:     (a, b) => {
		const aType = typeof a;
		const bType = typeof b;
		if (aType === 'string' && bType === 'string') {
			return a.includes(b);
		}
		if (aType === 'number' && bType === 'number') {
			return a === b;
		}
		return +a === +b;
	},
	alike:    (a, b) => (_.isString(a) && _.isString(b)) ? a.toLowerCase().includes(b.toLowerCase()) : false,
	contains: (a, b) => (_.isString(a) && _.isString(b)) ? a.toLowerCase().indexOf(b.toLowerCase()) > -1 : false,
	in:       (item, values) => values.includes(item),
	out:      (item, values) => !values.includes(item)
};

export const queryNodeHandlerFactory = (node: AbstractQueryNode) => {
	if (node instanceof AbstractScalarNode) {
		return item => {
			if (!item.hasOwnProperty(node.field)) {
				throw new Error(`There is not ${ node.field } field in list`);
			}
			const handler = nodesMap[node.name];
			return handler ? handler(item[node.field], node.value) : true;
		};
	} else if (node instanceof AbstractArrayNode) {
		return item => {
			if (!item.hasOwnProperty(node.field)) {
				throw new Error(`There is not ${ node.field } field in list`);
			}
			const handler = nodesMap[node.name];
			return handler ? handler(item[node.field], node.values) : true;
		};
	} else if (node instanceof AggregateFunctionNode) {
		console.log('f node', node);
	}
	return () => true;
};
