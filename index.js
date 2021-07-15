// Variable to hold a copy of preprocessed data globaly
let processedData = {}

// (not important) Select chart for exc 2
var ctx = document.getElementById('complex_graph').getContext('2d');
let complexGraph;

//fetch data from local storage
fetch('./data.json')
  .then(response => response.json())
  .then(response => {
    // Pre Proccess the data to handle missing values 
    preProcess(response)

    /* The first line graph will show the average 
    traffic_valume over date_time each year */

    //Save the years into an array
    let years = [...new Set(processedData.map(event => new Date(event.date_time).getFullYear()))]
    // Get average traffic volume fors each year
    let avgTrafficSimple = years.map(el => {
      return avgTrafficYear(el)
    })

    //Plot the information to the graph
    simpleGraphPlot(years, avgTrafficSimple, "simple_traffic", "Average Yearly Traffic")

    // The second graph will show the average temp each year
    let averageTempSimple = years.map(el => {
      return avgTempYear(el)
    })

    //Plot the information to the second graph
    simpleGraphPlot(years, averageTempSimple, "simple_temp", "Average Temperatyre yearly")

    // Plot the graph for EXC 2
    updateComplexGraph()
  }
  )

$("#update").click(() => { complexGraph.destroy(); updateComplexGraph() });


const updateComplexGraph = () => {
  //Get the values from the input fields
  let rainCheck, snowCheck, cloudsCheck, startDate, endDate;
  if ($('#rain').is(':checked')) { rainCheck = true } else { rainCheck = false }
  if ($('#snow').is(':checked')) { snowCheck = true } else { snowCheck = false }
  if ($('#clouds').is(':checked')) { cloudsCheck = true } else { cloudsCheck = false }
  startDate = new Date($('#startDate').val()).setHours(00, 00, 00)
  endDate = new Date($('#endDate').val()).setHours(23, 59, 59)

  // Filter data on selected days
  let dataOnTimeRange = processedData.filter((el, index) => {
    let currentDay = new Date(el.date_time)
    if (currentDay > startDate && currentDay < endDate) {
      return el
    }
  })

  /* Since this graph will have multiple variables
  the data needs to be normalized, i decided to use linear 
  normalization 
  1. Get max and min of attributes*/

  //  let maxTemp = getMinOrMax('max',"temp",dataOnTimeRange)
  // let minTemp = getMinOrMax('min',"temp",dataOnTimeRange)
  let maxTraffic = getMinOrMax('max', "traffic_volume", dataOnTimeRange)
  let minTraffic = getMinOrMax('min', "traffic_volume", dataOnTimeRange)
  let maxRain = getMinOrMax('max', "rain_1h", dataOnTimeRange)
  let minRain = getMinOrMax('min', "rain_1h", dataOnTimeRange)
  let maxSnow = getMinOrMax('max', "snow_1h", dataOnTimeRange)
  let minSnow = getMinOrMax('min', "snow_1h", dataOnTimeRange)
  let maxClouds = getMinOrMax('max', "clouds_all", dataOnTimeRange)
  let minClouds = getMinOrMax('min', "clouds_all", dataOnTimeRange)

  // Normalize the values using the formula (v-min)/(max-min)
  let normalizedData = dataOnTimeRange.map(el => {
    el.traffic_volume = ((el.traffic_volume - minTraffic) / (maxTraffic - minTraffic)).toFixed(2) * 1 || 0
    el.rain_1h = ((el.rain_1h - minRain) / (maxRain - minRain)).toFixed(2) * 1 || 0
    el.snow_1h = ((el.snow_1h - minSnow) / (maxSnow - minSnow)).toFixed(2) * 1 || 0
    el.clouds_all = ((el.clouds_all - minClouds) / (maxClouds - minClouds)).toFixed(2) * 1 || 0
    return el
  })

  let graphLabel = normalizedData.map(el => el.date_time)
  let rainDataset = {
    label: "Rain",
    data: normalizedData.map(el => el.rain_1h),
    borderColor: "rgb(0, 153, 255)",
    pointRadius: 0,
  }

  let snowDataset = {
    label: "Snow",
    data: normalizedData.map(el => el.snow_1h),
    borderColor: "rgb(204, 255, 255)",
    pointRadius: 0,
  }
  let cloudsDataset = {
    label: "Clouds",
    data: normalizedData.map(el => el.clouds_all),
    borderColor: "rgb(153, 153, 255)",
    pointRadius: 0,
  }
  let trafficDataset = {
    label: "Traffic Volume",
    data: normalizedData.map(el => el.traffic_volume),
    borderColor: "rgb(0, 0, 0)",
    pointRadius: 0,
    segment: {
      borderColor: (ctx) => down(ctx, "#0000ff", "#4d00b2", "#660099", "#73008c","#990066","#b2004c", "#ff0000")
    }
  }

  let graphDatasets = []
  graphDatasets.push(trafficDataset)
  rainCheck ? graphDatasets.push(rainDataset) : null;
  snowCheck ? graphDatasets.push(snowDataset) : null;
  cloudsCheck ? graphDatasets.push(cloudsDataset) : null;

  complexGraph = new Chart(ctx, {
    type: 'line',
    data: {
      labels: graphLabel,
      datasets: graphDatasets
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
      }
    }
  })
  complexGraph.update()

}
const down = (ctx, value1,value2,value3,value4,value5,valu6,value7) => {
  if (ctx.p0.parsed.y > 0) {
    temp = processedData[ctx.p0.$context.dataIndex].temp;
    if (temp > -40 && temp < -30) {
      return value1
    } else if (temp > -30 && temp < -20) {
      return value2
    } else if (temp > -20 && temp < -10) {
      return value3
    } else if (temp > -10 && temp < 0) {
      return value4
    }else if (temp > 0 && temp < 20) {
      return value5
    }else if (temp > 20 && temp < 30) {
      return valu6
    }else if (temp > 30 && temp < 40) {
      return value7
    }
  } else {
    temp = processedData[ctx.p0.$context.dataIndex].temp;
    if (temp > -40 && temp < -30) {
      return value1
    } else if (temp > -30 && temp < -20) {
      return value2
    } else if (temp > -20 && temp < -10) {
      return value3
    } else if (temp > -10 && temp < 0) {
      return value4
    }else if (temp > 10 && temp < 20) {
      return value5
    }else if (temp > 20 && temp < 30) {
      return valu6
    }else if (temp > 30 && temp < 40) {
      return value7
    }
  }

}


const getMinOrMax = (type, key, array) => {
  return Math[type].apply(Math, array.map(function (o) { return o[key]; }))
}
// Function for generating graphs
const simpleGraphPlot = (xAxis, yAxis, path, desc) => {
  var chart = new Chart(document.getElementById(path), {
    type: 'line',
    data: {
      labels: xAxis,
      datasets: [{
        data: yAxis,
        label: desc,
        borderColor: "#" + ((1 << 24) * Math.random() | 0).toString(16),
        fill: true,
      }]
    },
  });
}
const avgTempYear = (year) => {
  let meanSum = 0;
  let meanLength = 0;
  processedData.map(el => {
    let tempYear = new Date(el.date_time).getFullYear()
    if (tempYear == year) {
      meanSum += el.temp
      meanLength++
    }
  })
  return (meanSum / meanLength).toFixed(2)

}
// Function that returns the average of traffic in a specific year
const avgTrafficYear = (year) => {
  let meanSum = 0;
  let meanLength = 0;
  processedData.map(el => {
    let tempYear = new Date(el.date_time).getFullYear()
    if (tempYear == year) {
      meanSum += el.traffic_volume
      meanLength++
    }
  })
  return (meanSum / meanLength).toFixed(2)
}

// Function to preprocess the data
const preProcess = (data) => {

  /* The data has missing temp values
  In order to fix this I will use the
  attribute mean as an approuch */

  //First step is to get the attribute mean
  let meanSum = 0;
  let meanLength = 0;
  data.map(el => {
    if (el.temp > 0) {
      meanSum += el.temp
      meanLength++;
    }
  })
  let mean = (meanSum / meanLength).toFixed(3)
  console.log(`Temp mean is: ${mean}`)


  //Now replace the missing values with the mean
  let fixedMean = data.map(el => {
    if (el.temp === 0) {
      el.temp = mean;
      return el
    } else {
      return el
    }
  })

  // Remove duplicated data  
  let distinctData = [...new Map(fixedMean.map(item =>
    [item["date_time"], item])).values()];

  // Convert Kelvin temp to Celcius
  let fixedTemp = distinctData.map(el => {
    el.temp = parseFloat((el.temp - 273.15).toFixed(2))
    return el
  })

  // Fix rain levels
  let fixedRain = fixedTemp.map(el => {
    if (el.rain_1h > 50) {
      el.rain_1h = 50
      return el
    } else {
      return el
    }
  })

  /* Missing dates will be ignored since
  there are too many attributes to handle*/
  processedData = fixedRain
}
