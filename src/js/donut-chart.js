const d3 = require('d3');

const DonutChart = (element, dataPrimary, dataDelta, dataColor, dimensions) => {

  let dims = Object.assign({
    width: 212,
    height: 212,
    margin: 212/6,
  }, dimensions);

  dims.radius = Math.min(dims.width, dims.height) / 2 - dims.margin;

  // Append SVG
  let svg = d3.select(element)
          .append('svg')
          .attr('viewBox', `0 0 ${dims.width} ${dims.height}`)
          .append('g')
          .attr('transform', `translate(${dims.width / 2}, ${dims.height / 2})`);

  // Data
  let data = { a: dataPrimary - dataDelta, b: dataDelta };
  // let color = d3.scaleOrdinal().domain(data).range(['#959FB9', '#FFFFFF']) // $PRIMARY-LIGHTER $BASE-LIGHTEST
  let color = d3.scaleOrdinal().domain(data).range(['#ededed', 'currentColor']) // $PRIMARY-LIGHTER $BASE-LIGHTEST

  // Compute Position
  let pie = d3.pie().value(d => d.value);
  let data_ready = pie(d3.entries(data));

  // Build Chart
  return {
    draw: () => {
      svg
        .selectAll('donut-chart')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
          .innerRadius(100)         // This is the size of the donut hole
          .outerRadius(dims.radius)
        )
        .attr('fill', d => color(d.data.key))
        // .attr('stroke', 'black')
        // .style('stroke-width', '2px')
        // .style('opacity', 0.7)
    }
  };
};

module.exports = DonutChart;
