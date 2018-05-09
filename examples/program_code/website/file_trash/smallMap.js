var smallMap = {
    width: 160,
    height: 160,
    scale: 40,
    defaultScale: 40,
    maxScale: 1000
};

smallMap.container = d3.select('#smallMapContainer')
    .attr('width', smallMap.width).attr('height', smallMap.height);

var smallProjection = d3.geo.azimuthal()
    .scale(smallMap.scale)
    .origin([50, 0])
    .mode('orthographic')
    .translate([smallMap.width / 2, smallMap.height / 2]);
smallMap.projection = smallProjection;

smallMap.circle = d3.geo.greatCircle().origin(smallProjection.origin());

smallMap.path = d3.geo.path().projection(smallProjection);
smallMap.svg = d3.select("#smallMap").append('svg:svg')
    .attr('width', smallMap.width)
    .attr('height', smallMap.height);
smallMap.continents = smallMap.svg.append('g')
    .attr('width', smallMap.width)
    .attr('height', smallMap.height)
    .attr('id', 'continents');


d3.json('file/continents.json', function (collection) {
    smallMap.continentFeature = smallMap.continents.selectAll('path')
        .data(collection.features)
        .enter().append('svg:path')
        .attr('d', smallMap.clip);

    smallMap.continentFeature.append("svg:title").text(function (d) {
        return d.properties.name;
    }).attr('text-anchor', 'middle');
});


smallMap.clip = function (d) { return smallMap.path(smallMap.circle.clip(d)); };

smallMap.mousedown = function(){
    smallMap.m0 = [d3.event.pageX, d3.event.pageY];
    smallMap.o0 = smallMap.projection.origin();
    d3.event.preventDefault();
};

smallMap.mousemove = function() {
    if (smallMap.m0) {
        var m0 = smallMap.m0, o0 = smallMap.o0;
        var m1 = [d3.event.pageX, d3.event.pageY];

        var o1 = [o0[0] + (m0[0] - m1[0]) * (300 / smallMap.scale / 4),
            o0[1] + (m1[1] - m0[1]) * (300 / smallMap.scale / 4)];

        smallProjection.origin(o1);
        smallMap.circle.origin(o1);
        smallMap.refresh();
    }
};

smallMap.mouseup = function() {
    if (smallMap.m0) {
        smallMap.mousemove();
        smallMap.m0 = null;
    }
};

smallMap.refresh = function(duration) {
    (duration ?
        smallMap.continentFeature.transition().duration(duration)
        : smallMap.continentFeature)
        .attr('d', smallMap.clip);
};

function showBottom(){
    var controls = document.getElementById('controls');
    if(controls.classList.contains('controls-hide')){
        controls.classList.add('controls-show');
        controls.classList.remove('controls-hide');
    } else {
        controls.classList.add('controls-hide');
        controls.classList.remove('controls-show');
    }
}

function configureSmall(){
    projection.origin(smallMap.projection.origin());
    circle.origin(smallMap.projection.origin());
    o0 = projection.origin();

    currentScale = defaultScale + (smallMap.scale - smallMap.defaultScale) *
        (defaultScale / smallMap.defaultScale);
    projection.scale(currentScale);

    refresh();
    refreshCircles();
}

d3.select('#scrollableParentSmallMap')
    .on('mousedown', function() { smallMap.mousedown() });

var scrollable = document.getElementById('scrollableSmallMap');
scrollable.scrollTop = scrollable.scrollHeight;
function scale(){
    var scrollable = document.getElementById('scrollableSmallMap');
    var amount = (scrollable.scrollHeight - scrollable.scrollTop)
        / scrollable.scrollHeight;
    console.log('scale', amount);

    smallMap.scale = smallMap.defaultScale +
        amount * (smallMap.maxScale - smallMap.defaultScale);

    smallMap.projection.scale(smallMap.scale);
    smallMap.refresh();

    var scaleInfo = document.getElementById('scaleInfo');
    scaleInfo.textContent = 'Scale: ' + String(Math.round(amount * 100)) + '%';
};
