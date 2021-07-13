// Variable to hold a copy of preprocessed data
let processedData = {}

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

  }
  )


// Function for generating graphs
const simpleGraphPlot = (xAxis, yAxis, path, desc) => {

  new Chart(document.getElementById(path), {
    type: 'line',
    data: {
      labels: xAxis,
      datasets: [{
        data: yAxis,
        label: desc,
        borderColor: "#" + ((1 << 24) * Math.random() | 0).toString(16),
        fill: "#606c76"
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
  return parseInt(meanSum / meanLength)

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
  return parseInt(meanSum / meanLength)
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
  let mean = parseInt(meanSum / meanLength)
  console.log(`Temp mean is: ${mean}`)


  //Now replace the missing values with the mean
  let newData = data.map(el => {
    if (el.temp === 0) {
      el.temp = mean;
      return el
    } else {
      return el
    }
  })

  /* Missing dates will be ignored since
  there are too many attributes to handle*/
  processedData = newData
}



/*
new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: [1500, 1600, 1700, 1750, 1800, 1850, 1900, 1950, 1999, 2050],
    datasets: [{
      data: [86, 114, 106, 106, 107, 111, 133, 221, 783, 2478],
      label: "Africa",
      borderColor: "#3e95cd",
      fill: false
    }, {
      data: [282, 350, 411, 502, 635, 809, 947, 1402, 3700, 5267],
      label: "Asia",
      borderColor: "#8e5ea2",
      fill: false
    }, {
      data: [168, 170, 178, 190, 203, 276, 408, 547, 675, 734],
      label: "Europe",
      borderColor: "#3cba9f",
      fill: false
    }, {
      data: [40, 20, 10, 16, 24, 38, 74, 167, 508, 784],
      label: "Latin America",
      borderColor: "#e8c3b9",
      fill: false
    }, {
      data: [6, 3, 2, 2, 7, 26, 82, 172, 312, 433],
      label: "North America",
      borderColor: "#c45850",
      fill: false
    }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'World population per region (in millions)'
    }
  }
});
*/