import _ from 'lodash';

import AbstractQueryNode   from 'rollun-ts-rql/dist/nodes/AbstractQueryNode';
import AbstractLogicalNode from 'rollun-ts-rql/dist/nodes/logicalNodes/AbstractLogicalNode';
import AbstractScalarNode  from 'rollun-ts-rql/dist/nodes/scalarNodes/AbstractScalarNode';
import AbstractArrayNode   from 'rollun-ts-rql/dist/nodes/arrayNodes/AbstractArrayNode';

import And                   from 'rollun-ts-rql/dist/nodes/logicalNodes/And';
import Or                    from 'rollun-ts-rql/dist/nodes/logicalNodes/Or';
import Eq                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Eq';
import Ne                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Ne';
import Le                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Le';
import Lt                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Lt';
import Ge                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Ge';
import Gt                    from 'rollun-ts-rql/dist/nodes/scalarNodes/Gt';
import Contains              from 'rollun-ts-rql/dist/nodes/scalarNodes/Contains';
import Like                  from 'rollun-ts-rql/dist/nodes/scalarNodes/Like';
import ALike                 from 'rollun-ts-rql/dist/nodes/scalarNodes/Alike';
import In                    from 'rollun-ts-rql/dist/nodes/arrayNodes/In';
import Out                   from 'rollun-ts-rql/dist/nodes/arrayNodes/Out';
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
	[Eq.name]:       (a, b) => a === b,
	[Ne.name]:       (a, b) => a !== b,
	[Le.name]:       (a, b) => a <= b,
	[Lt.name]:       (a, b) => a < b,
	[Ge.name]:       (a, b) => a >= b,
	[Gt.name]:       (a, b) => a > b,
	[Like.name]:     (a, b) => {
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
	[ALike.name]:    (a, b) => (_.isString(a) && _.isString(b)) ? a.toLowerCase().includes(b.toLowerCase()) : false,
	[Contains.name]: (a, b) => (_.isString(a) && _.isString(b)) ? a.toLowerCase().indexOf(b.toLowerCase()) > -1 : false,
	[In.name]:       (item, values) => values.includes(item),
	[Out.name]:      (item, values) => !values.includes(item)
};

export const queryNodeHandlerFactory = (node: AbstractQueryNode) => {
	if (node instanceof AbstractScalarNode) {
		return item => {
			if (!item.hasOwnProperty(node.field)) {
				throw new Error(`There is not ${ node.field } field in list`);
			}
			const handler = nodesMap[node.constructor.name];
			return handler ? handler(item[node.field], node.value) : true;
		};
	} else if (node instanceof AbstractArrayNode) {
		return item => {
			if (!item.hasOwnProperty(node.field)) {
				throw new Error(`There is not ${ node.field } field in list`);
			}
			const handler = nodesMap[node.constructor.name];
			return handler ? handler(item[node.field], node.values) : true;
		};
	} else if (node instanceof AggregateFunctionNode) {
		console.log('f node', node);
	}
	return () => true;
};
