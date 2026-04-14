const d3 = require('d3');
window.moment = require('moment');

const defaultSettings = {
  height: 11,
  radius: 4.5,
  sdColor: '#790022', // SECONDARY-DARKER COLOR
  slColor: '#EFEFEF', // SECONDARY-LIGHTER COLOUR
  margin: {top: 0, right: 10, bottom: 0, left: 0},
};

const Timeline = (data, dest, options) => {
  let timeline = this;

  this.data = data;
  this.elem = document.querySelector(dest);
  this.settings = {}
  tooltipDelay = null;

  if(this.elem) {
    this.settings = Object.assign({
      width: this.elem.offsetWidth,
    }, defaultSettings, options);
  }
  else {
    return;
  }

  window.tooltip  = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .attr('id', 'timeline-tooltip')
                    .style('opacity', 0);

  const showToolTip = (d, idx, elems) => {
    clearTimeout(tooltipDelay);
    elems[idx].classList.add('focus');
    tooltip.transition()
      .duration(200)
      .style('opacity', 1.0);

      tooltip.html(`<h6>${d.subjectmatter}</h6><time>${moment(d.date).format('MMMM D, Y')}</time>`)
      .style('left', `${d3.event.pageX - (tooltip.node().offsetWidth/2)}px`)
      .style('bottom', `${window.innerHeight - timeline.elem.offsetTop + 20}px`);
  }; // showToolTip

  const hideToolTip = (d, idx, elems) => {

    tooltipDelay = setTimeout(() => {
      elems[idx].classList.remove('focus');
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    }, 250);

  };

  return {
    data: this.data,
    timeline: timeline,
    draw: () => {
      timeline.data.forEach(function(d) {
        d.day = +d.date.split('/')[0];
        d.month = +d.date.split('/')[1];
        d.year = +d.date.split('/')[2];
        d.utc = new Date(d.year, d.month - 1, d.day).getTime() / 1000;
      });

      let svg = d3
        .select(timeline.elem)
        .append('svg')
          .attr('viewBox', `0 0 ${timeline.settings.width} ${timeline.settings.height}`)
          .append('g')
            .attr('class', 'line')
            .attr('transform', `translate(${timeline.settings.margin.left}, ${timeline.settings.margin.top})`);

      const inauguration = new Date(2017, 0, 20).getTime() / 1000; // Trump's Inauguration date
      const biden = new Date(2021, 0, 20).getTime() / 1000; // Biden's Inauguration date

      // X AXIS
      timeline.x = d3
        .scaleTime()
        .domain([inauguration, biden])
        .range([ 0, timeline.settings.width ])

        svg
        .append('g')
          .attr('transform', `translate(0, ${timeline.settings.height / 2})`)
          .attr("class", "dataviz-timeline-axis")
          .attr('stroke', timeline.settings.slColor)
          .call(d3.axisBottom(timeline.x).tickSize(0).tickValues([]));

      // Y AXIS
      timeline.y = d3
        .scaleLinear()
        .domain(Array(this.data.length - 1).fill(0))
        .range([ timeline.settings.height, 0 ]);

      svg
        .append('g')
          .call(d3.axisLeft(timeline.y).tickSize(0).tickValues([]))
          .call(g => g.select('.domain').remove());


      // CIRCLES
      svg
        .append('g')
          .attr('class', 'dots')
          .selectAll('dot')
            .data(timeline.data)
            .enter()
              .append('circle')
                .attr('cx', function (d) { return timeline.x(d.utc); } )
                .attr('cy', function (d) { return timeline.y(0) || 5; } )
                .attr('r', timeline.settings.radius)
                .attr('stroke', timeline.settings.sdColor);
                // .on('mouseover', showToolTip)
                // .on('mouseout', hideToolTip)
      }, // draw
  }; // return
}; // Timeline

module.exports = Timeline;
