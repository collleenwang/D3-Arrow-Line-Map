(function() {
  let margin = { top: 0, left: 0, right: 0, bottom: 0 }

  let height = 300 - margin.top - margin.bottom
  let width = 330 - margin.left - margin.right

  let svg = d3.select('#powerplants-icons')
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  let projection = d3.geoAlbersUsa()
  var colorScale = d3
    .scaleOrdinal()
    .range([
      '#ec913f',
      '#99979a',
      '#c1619c',
      '#2a83c2',
      '#de473a',
      '#51a74c',
      '#d7c54f',
      '#fdeed7'
    ])

  let radiusScale = d3
    .scaleSqrt()
    .domain([0, 5000])
    .range([0, 10])

  // out geoPath needs a PROJECTION variable
  let path = d3.geoPath().projection(projection)

  Promise.all([
    d3.json('./data/us_states.topojson'),
    d3.csv('./data/powerplants.csv')
  ])
    .then(ready)
    .catch(err => console.log('Failed on', err))

  function ready([json, datapoints]) {
    let states = topojson.feature(json, json.objects.us_states)

    projection.fitSize([width, height], states)

    var nested = d3
      .nest()
      .key(d => d.PrimSource)
      .entries(datapoints)

    svg
      .append('g')
      .selectAll('.state')
      .data(states.features)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', path)
      .attr('fill', '#e1e1e1')

    svg
      .append('g')
      .selectAll('circle')
      .data(datapoints)
      .enter()
      .append('circle')
      .attr('r', d => radiusScale(d.Total_MW))
      .attr('transform', d => {
        let coords = projection([d.Longitude, d.Latitude])
        return `translate(${coords})`
      })
      .attr('fill', d => colorScale(d.PrimSource))
      .attr('opacity', 0.5)
  }
})()