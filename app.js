// Define SVG dimensions
const width = 700;
const height = 700;

// Create an SVG element
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color", "#333333")
    .append('g');

// Create a zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.5, 8])
    .on("zoom", zoomed);

// Apply zoom behavior to the SVG
svg.call(zoom);

// Projection for the map
const projection = d3.geoMercator()
    .center([-2, 54])
    .scale(2000)
    .translate([width / 2, height / 2]);

// Path generator
const path = d3.geoPath().projection(projection);

// Function to draw the map
function drawMap(geoData) {
    svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#005500")
        .attr("stroke", "#f9f9f9")
        .attr("stroke-width", 0.5);
}

// Function to add circles for cities with animation
function addCityCircles(cityData) {
    // Existing circles removal with an exit transition
    svg.selectAll("circle").remove();

    // Add circles for the new data with a falling animation
    const circles = svg.selectAll("myCircles")
        .data(cityData)
        .enter()
        .append('g');

        circles
        .append("circle")
        .attr("cx", function(q) { 
            // Apply the map transformation to the circle positions
            const [x, y] = projection([q.lng, q.lat]);
            return x;
        })
        .attr("cy", -10) 
        .attr("r", 5)
        .style("fill", "#FFD700")
        .attr("stroke", "#FF0000")
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)
        .transition() 
        .duration(1000)
        .attr("cy", function(q) { 
            const [x, y] = projection([q.lng, q.lat]);
            return y;
        });

            
        
        // Add tooltip div (Define tooltip here in the same scope)
        const tooltip = d3.select("body").append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

        // Show/hide tooltip on hover
        circles.on("mouseover", function(event, q) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(
                `<strong>Town:</strong> ${q.Town}<br>
                <strong>Population:</strong> ${q.Population}<br>
                <strong>County:</strong> ${q.County}<br>
                <strong>Latitude:</strong> ${q.lat}<br>
                <strong>Longitude:</strong> ${q.lng}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

}

// Function to handle errors in data fetching
function handleDataFetchError(error) {
    console.error('Error fetching data:', error);
    
}

// Function to update city count and circles
function updateCityCount() {
    const sliderValue = +document.getElementById("citySlider").value;

    // Update city count text
    document.getElementById("cityCount").textContent = `Cities: ${sliderValue}`;

    d3.json(`http://34.38.72.236/Circles/Towns/${sliderValue}`)
        .then(addCityCircles)
        .catch(handleDataFetchError);
}
// Function to reset the map to its original position
function resetMap() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}

// Event listeners
document.getElementById("citySlider").addEventListener("input", updateCityCount);
document.getElementById("refreshButton").addEventListener("click", function() {
    updateCityCount();
    resetMap(); // Reset the map on refresh button click
});
document.getElementById("zoomIn").addEventListener("click", () => handleZoom(1.5));
document.getElementById("zoomOut").addEventListener("click", () => handleZoom(0.5));

// Initial map setup
d3.json("https://gist.githubusercontent.com/carmoreira/49fd11a591e0ce2c41d36f9fa96c9b49/raw/e032a0174fc35a416cff3ef7cf1233973c018294/ukcounties.json")
    .then(drawMap)
    .then(() => {
        // Load initial city circles or specify a default count
        updateCityCount(); // This initiates the loading of city circles
    })
    .catch(handleDataFetchError);


// Function to handle zoom
function handleZoom(scale) {
    svg.transition()
        .duration(750)
        .call(zoom.scaleBy, scale);
}

// Define the zoomed function
// Define the zoomed function
function zoomed(event) {
    svg.selectAll("path").attr("transform", event.transform);

    svg.selectAll("circle")
        .attr("cx", function(q) {
            const [x, y] = projection([q.lng, q.lat]);
            return event.transform.applyX(x);
        })
        .attr("cy", function(q) {
            const [x, y] = projection([q.lng, q.lat]);
            return event.transform.applyY(y);
        });
}


