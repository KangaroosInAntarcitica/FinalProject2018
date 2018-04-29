var extra = 100;
var width = document.body.clientWidth - 10;
var height = document.body.clientHeight - 10;
var square = width > height ? height : width;

var countryFeature;
var datacentreFeature;


// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
    orthographic: 380, stereographic: 380, gnomonic: 380,
    equidistant: 380 / Math.PI * 2, equalarea: 380 / Math.SQRT2
};
var currentScale = 300;
var defaultScale = 300;

var projection = d3.geo.azimuthal()
    .scale(currentScale)
    .origin([50, 0])
    .mode('orthographic')
    .translate([width / 2, height / 2]);

var circle = d3.geo.greatCircle().origin(projection.origin());

var path = d3.geo.path().projection(projection);
var svg = d3.select("#chart").append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .on('mousedown', mousedown);
var countries = svg.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'countries');
var dataCentres = svg.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'dataCentres');


d3.json('file/world.json', function (collection) {
    countryFeature = countries.selectAll('path')
        .data(collection.features)
        .enter().append('svg:path')
        .attr('d', clip);

    countryFeature.append("svg:title").text(function (d) {
        return d.properties.name;
    }).attr('text-anchor', 'middle');
});

d3.json('file/uk_all_page_coords_clear.json', function (json) {
    dataCentreFeature = dataCentres.selectAll('path')
        .data(json.features)
        .enter()
        .append('svg:path')
        .attr('d', clip)
        .attr('class', 'circle-path');
        // .append('svg:circle')
        // .attr('r', function (d) {
        //     return 1;
        // })
        // .attr("fill", '#FFF');

    dataCentreFeature.append("svg:title").text(function (d) {
        return d.properties.title;
    }).attr('text-anchor', 'middle');

    dataCentreFeature = dataCentres.selectAll('path');
    console.log(dataCentreFeature);
});


d3.select(window).on('mousemove', mousemove).on('mouseup', mouseup);
var m0, o0;

function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.origin();
    d3.event.preventDefault();
    hideCircles();
}

function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY];

        var o1 = [o0[0] + (m0[0] - m1[0]) * (300 / currentScale / 8),
            o0[1] + (m1[1] - m0[1]) * (300 / currentScale / 8)];

        projection.origin(o1);
        circle.origin(o1);
        refresh();
    }


    window.smallMap ? window.smallMap.mousemove() : null;
}

function mouseup() {
    if (m0) {
        mousemove();
        m0 = null;
    }
    refreshCircles();

    window.smallMap ? window.smallMap.mouseup() : null;
}

function refresh(duration) {
    (duration ?
        countryFeature.transition().duration(duration)
        : countryFeature)
        .attr('d', clip);
}

function refreshCircles(duration) {
    (duration ?
        dataCentreFeature.transition().duration(duration)
        : dataCentreFeature)
        .attr('d', clip);
    dataCentreFeature.attr('class', 'circle-path');
}

function hideCircles() {
    dataCentreFeature.attr('class', 'circle-none');
}

function clip(d) {
    return path(circle.clip(d));
}

function scaleMap(where){
    if(where === '+') {
        currentScale *= 1.5;
    }
    else if (where === '-')
        currentScale /= 1.5;

    projection.scale(currentScale);
    refresh();
    refreshCircles();
}
