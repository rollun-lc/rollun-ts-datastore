const fs     = require("fs");

const {total}  = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf-8'));
const getBadge = (value, percentage) => {
    if (percentage < 70) {
        return `Coverage%20${value}-${percentage}%25-red.svg`;
    } else if (percentage < 80) {
        return `Coverage%20${value}-${percentage}%25-orange.svg`;
    } else if (percentage < 100) {
        return `Coverage%20${value}-${percentage}%25-green.svg`;
    } else {
        return `Coverage%20${value}-0%25-red.svg`
    }
}
const allCoverage = {
    'Statements': getBadge('Statements', total.statements.pct),
    'Lines':      getBadge('Lines', total.lines.pct),
    'Functions':  getBadge('Functions', total.functions.pct),
    'Branches':   getBadge('Branches', total.branches.pct)
}

const getCoverageBadge = (name) => {
    return allCoverage[name];
}

const readMe = fs.readFileSync('./README.md', 'utf-8');

fs.writeFileSync('./README.md', readMe.replace(/Coverage%20(.+)\-([.0-9]+)%25-(.+)\.svg/g, (match, name) => {
    return getCoverageBadge(name);
}), 'utf-8');
