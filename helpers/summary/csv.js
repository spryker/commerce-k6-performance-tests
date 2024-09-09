
function generateCsvSummary(data, options) {
    let mergedOpts = Object.assign({}, data.options, options);
    let lines = [];
    //
    // Array.prototype.push.apply(
    //     lines,
    //     summarizeGroup(mergedOpts.indent + '    ', data.root_group, text),
    // );

    Array.prototype.push.apply(
        lines,
        summarizeMetrics(mergedOpts, data, decorate),
    );

    return lines.join('\n');
}

exports.textSummary = generateCsvSummary;