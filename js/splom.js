d3.json("data/splom.json", function(house) {
    // Size parameters.
    var size = 150,
      padding = 19.5,
      n = house.traits.length;

    // Position scales.
    var x = {}, y = {};
    house.traits.forEach(function(trait) {
        var value = function(d) { return d[trait]; },
            domain = [d3.min(house.values, value), d3.max(house.values, value)],
            range = [padding / 2, size - padding / 2];
        x[trait] = d3.scale.linear()
            .domain(domain)
            .range(range);

        y[trait] = d3.scale.linear()
            .domain(domain)
            .range(range.slice().reverse());
    });

    // Axes.
    var axis = d3.svg.axis()
      .ticks(5)
      .tickSize(size * n);

    // Brush.
    var brush = d3.svg.brush()
      .on("brushstart", brushstart)
      .on("brush", brush)
      .on("brushend", brushend);

    // Root panel.
    var svg = d3.select("#chart").append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding);

    // X-axis.
    svg.selectAll("g.x.axis")
        .data(house.traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + i * size + ",0)"; })
        .each(function(d) { d3.select(this).call(axis.scale(x[d]).orient("bottom")); });

    // Y-axis.
    svg.selectAll("g.y.axis")
        .data(house.traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { d3.select(this).call(axis.scale(y[d]).orient("right")); });

    // Cell and plot.
    var cell = svg.selectAll("g.cell")
        .data(cross(house.traits, house.traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i == d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    function plot(p) {
    var cell = d3.select(this);

    // Plot frame.
    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    // Plot dots.
    cell.selectAll("circle")
        .data(house.values)
      .enter().append("circle")
        .attr("class", function(d) { return d.latitude; })
        .attr("cx", function(d) { return x[p.x](d[p.x]); })
        .attr("cy", function(d) { return y[p.y](d[p.y]); })
        .attr("r", 3);

    // Plot brush.
    cell.call(brush.x(x[p.x]).y(y[p.y]));
    }

    // Clear the previously-active brush, if any.
    function brushstart(p) {
        if (brush.data !== p) {
          cell.call(brush.clear());
          brush.x(x[p.x]).y(y[p.y]).data = p;
        }
    }

    // Highlight the selected circles.
    function brush(p) {
        var e = brush.extent();
        svg.selectAll("circle").attr("class", function(d) {
          return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
              && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
              ? d.latitude : null;
        });
    }

    // If the brush is empty, select all circles.
    function brushend() {
        if (brush.empty()) svg.selectAll("circle").attr("class", function(d) {
          return d.latitude;
        });
    }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
    }
});
