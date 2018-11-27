(function() {
  let margin = { top: 0, left: 20, right: 20, bottom: 0 }

  let height = 400 - margin.top - margin.bottom

  let width = 700 - margin.left - margin.right

  let svg = d3
    .select('#flights')
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  let projection = d3.geoEqualEarth()

  let path = d3.geoPath().projection(projection)

  Promise.all([
    d3.json('data/world.topojson'),
    d3.csv('data/flights.csv'),
    d3.csv('data/airport-codes-subset.csv')
  ])
    .then(ready)
    .catch(err => console.log('Failed on', err))

  let coordinateStore = d3.map()

  function ready([json, flights, airports]) {
    let countries = topojson.feature(json, json.objects.countries)
    
    projection.fitSize([width, height], countries)

    airports.forEach(function(d) {
      coordinateStore.set(d.iata_code, [d.longitude, d.latitude])
    })

    svg
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', '#9ED0EA')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)

    svg
      .append('g')
      .selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path)
      .attr('fill', 'lightgray')
      .attr('stroke', 'black')
      .attr('stroke-width', 0.25)

    svg
      .append('g')
      .selectAll('circle')
      .data(airports)
      .enter()
      .append('circle')
      .attr('r', 2)
      .attr(
        'transform',
        d => `translate(${projection([d.longitude, d.latitude])})`
      )
      .attr('fill', 'white')

    let nyc = [-74, 40]

    svg.append('g')
      .selectAll('flights')
      .data(flights)
      .enter()
      .append('path')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('d', d => {
        console.log([nyc, coordinateStore.get(d.code)])
        let geoLine = {
          type: 'LineString',
          coordinates: [nyc, coordinateStore.get(d.code)]
        }
        return path(geoLine)
      })
      .attr('fill', 'none')
  }
})()
