var MOBILE_THRESHOLD = 600;
var main_data_url = "data/percents.csv";
var isMobile = false;
var FORMATTER,
    VAL,
    LINEVAL,
    YEARVAL,
    NUMTICKS,
    $GRAPHDIV,
    $LEGENDDIV,
    COLORS,
    BREAKS,
    LABELS,
    stateSelect,
    height_multiplier;
var $graphic = $('#graphic');
var barchart_aspect_width = 1;
var BREAKS = [0, 2, 1];
var COLORS = ["#000", "#00578b", "#1696d2"];
var LABELS = ["State-based marketplace", "State-based using healthcare.gov", "Federally facilitated marketplace"]
var FORMATTER = d3.format("%");
var numticks = 6;

function catlegend(div) {

    var margin = {
        top: 3,
        right: 1,
        bottom: 5,
        left: 1
    };

    var width = $LEGENDDIV.width() - margin.left - margin.right,
        height = 30 - margin.top - margin.bottom;

    $LEGENDDIV.empty();

    var svg = d3.select(div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var lp_w = 200,
        ls_w = 30,
        ls_h = 15;

    var legend = svg.selectAll("g.legend")
        .data(LABELS)
        .enter().append("g")
        .attr("class", "legend");

    legend.append("text")
        .data(LABELS)
        .attr("x", function (d, i) {
            return (i * (ls_w + lp_w)) + ls_w + 5;
        })
        .attr("y", 22)
        .text(function (d, i) {
            return d;
        });

    legend.append("rect")
        .data(COLORS)
        .attr("x", function (d, i) {
            return (i * (ls_w + lp_w));
        })
        .attr("y", 10)
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function (d, i) {
            return COLORS[i];
        })
}

function barchart(container_width) {

    var color = d3.scale.ordinal()
        .domain(BREAKS)
        .range(COLORS);

    data.sort(function (a, b) {
        return a[VAL] - b[VAL];
    });

    data.forEach(function (d) {
        d[VAL] = +d[VAL];
    });


    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }

    //vertical bar chart on mobile
    if (container_width < MOBILE_THRESHOLD) {
        var barchart_aspect_height = 2.4;
        var margin = {
            top: 25,
            right: 15,
            bottom: 25,
            left: 25
        };

        var width = container_width - margin.left - margin.right,
            height = Math.ceil((width * barchart_aspect_height) / barchart_aspect_width) - margin.top - margin.bottom;

        $graphic.empty();

        var svg = d3.select("#graphic").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .2)
            .domain(data.map(function (d) {
                return d.abbrev;
            }));

        var x = d3.scale.linear()
            .range([0, width])
            .domain(d3.extent(data, function (d) {
                return d[VAL];
            }));

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(0)
            .orient("left");

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(height)
            .tickFormat(FORMATTER)
            .ticks(numticks / 2)
            .orient("top");

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var gx = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .call(xAxis);

        gx.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        var pctbar = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g");

        pctbar.append("rect")
            .attr('id', function (d) {
                return d.abbrev;
            })
            .attr("fill", function (d) {
                return color(d.ffm);
            })
            .attr("class", "bar")
            .attr("x", function (d) {
                return Math.min(x(d[VAL]), x(0));
            })
            .attr("width", function (d) {
                return Math.abs(x(0) - (x(d[VAL])));
            })
            .attr("y", function (d) {
                return y(d.abbrev);
            })
            .attr("height", y.rangeBand());
        /*            .on("click", function (d) {
                        dispatch.clickState(this.id);
                    })
                    .on("mouseover", function (d) {
                        if (isIE != false) {
                            d3.selectAll(".hovered")
                                .classed("hovered", false);
                            d3.selectAll("#" + this.id)
                                .classed("hovered", true)
                                .moveToFront();
                            tooltip(this.id);
                            this.parentNode.appendChild(this);
                            console.log("I'm using the worst browser test4");
                        } else {
                            dispatch.hoverState(this.id);
                        }
                    })
                    .on("mouseout", function (d) {
                        dispatch.dehoverState(this.id);
                    });*/

    } else {
        var barchart_aspect_height = 0.3;
        var margin = {
            top: 5,
            right: 5,
            bottom: 25,
            left: 35
        };

        var width = container_width - margin.left - margin.right,
            height = Math.ceil((width * barchart_aspect_height) / barchart_aspect_width) - margin.top - margin.bottom;

        $graphic.empty();

        var svg = d3.select("#graphic").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(data.map(function (d) {
                return d.abbrev;
            }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .orient("bottom");

        var y = d3.scale.linear()
            .range([height, 0]);

        var ymin = d3.min(data, function (d) {
            return d[VAL];
        });

        if (ymin >= 0) {
            y.domain([0, d3.max(data, function (d) {
                return d[VAL];
            })]);
        } else {
            y.domain(d3.extent(data, function (d) {
                return d[VAL];
            }));
        }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(FORMATTER)
            .ticks(numticks)
            .tickSize(-width);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        gy.selectAll("text")
            .attr("x", -4)
            .attr("dy", 4);

        var neglabels = svg.selectAll("g.neglabels")
            .data(data)
            .enter().append("g")
            .attr("class", "abbrevs");

        neglabels.append("text")
            .attr("text-anchor", "center")
            .attr("x", function (d) {
                return x(d.abbrev) + 0.4 * x.rangeBand();
            })
            .attr("y", function (d) {
                return y(0) + (10 * (Math.abs(d[VAL])) / d[VAL]) + 2;
            })
            .text(function (d) {
                return d.abbrev;
            });

        var pctbar = svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("g");

        pctbar.append("rect")
            .attr('id', function (d) {
                return d.abbrev;
            })
            .attr("fill", function (d) {
                return color(d.ffm);
            })
            .attr("class", "bar")
            .attr("x", function (d) {
                return x(d.abbrev);
            })
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
                return Math.min(y(d[VAL]), y(0));
            })
            .attr("height", function (d) {
                return Math.abs(y(0) - (y(d[VAL])));
            });
        /*            .on("click", function (d) {
                        dispatch.clickState(this.id);
                    })
                    .on("mouseover", function (d) {
                        if (isIE != false) {
                            d3.selectAll(".hovered")
                                .classed("hovered", false);
                            d3.selectAll("#" + this.id)
                                .classed("hovered", true)
                                .moveToFront();
                            tooltip(this.id);
                            this.parentNode.appendChild(this);
                        } else {
                            dispatch.hoverState(this.id);
                        }
                    })
                    .on("mouseout", function (d) {
                        dispatch.dehoverState(this.id);
                    });*/
    }
    if (VAL == "eselect") {
        $LEGENDDIV = $("#legend");
        catlegend("#legend");
    }
}

function effectproject() {
    $GRAPHDIV = $("#effectproject");
    FORMATTER = formatpct;
    VAL = "eproject";
    numticks = 6;
    isMobile = false;
    barchart("#effectproject");
}