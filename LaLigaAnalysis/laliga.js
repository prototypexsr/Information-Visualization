let teambody = d3.select("#TeamList")
let graphbody = d3.select("#Graph")

let store = {}

function loadData(){
    let promise = d3.csv("laligaseason-1718_csv.csv")
    return promise.then(teams => {
        store.teams = teams
        return store;
    })
}

function groupByHomeTeam(data){
    let teams = store.teams
    var result = data.reduce((result,d)   => {
        var currentData = result[d.HomeTeam] || {
            HomeTeam: d.HomeTeam,
            HS: +d.HS,
            HST: +d.HST,
            HG: +d.FTHG,
            HF: +d.HF,
            HC: +d.HC,
            HY: +d.HY,
            HR: +d.HR,
            matchResults: [],
            Wins: 0,
            Draws: 0,
            Defeats: 0,
            pointsEarned: 0,
            bookingPoints: 0
        }    
        
        result[d.HomeTeam] = currentData
        result[d.HomeTeam].HS += +d.HS
        result[d.HomeTeam].HST += +d.HST
        result[d.HomeTeam].HG += +d.FTHG
        result[d.HomeTeam].HF += +d.HF
        result[d.HomeTeam].HC += +d.HC
        result[d.HomeTeam].HY += +d.HY
        result[d.HomeTeam].HR += +d.HR
        result[d.HomeTeam].bookingPoints = (10 * result[d.HomeTeam].HY + 25 *  result[d.HomeTeam].HR)
        result[d.HomeTeam].matchResults.push(d.FTR)
        result[d.HomeTeam].Wins = result[d.HomeTeam].matchResults.reduce(function(n, val){
            return n + (val === "H")

        }, 0)
        result[d.HomeTeam].Draws = result[d.HomeTeam].matchResults.reduce(function(n, val){
            return n + (val === "D")

        }, 0)
        result[d.HomeTeam].Defeats = result[d.HomeTeam].matchResults.reduce(function(n, val){
            return n + (val === "A")

        }, 0)
        result[d.HomeTeam].pointsEarned = (3 * result[d.HomeTeam].Wins + result[d.HomeTeam].Draws) 
        
        return result;
    

    }, {})


    result = Object.keys(result).map(key => result[key])
    result = result.sort(d3.descending)

    return result
}

function groupByAwayTeam(data){
    let awaywins = 0
    let result = data.reduce((result,d)   => {
        let currentData = result[d.AwayTeam] || {
            AwayTeam: d.AwayTeam,
            AS: +d.AS,
            AST: +d.AST,
            AG: +d.FTAG,
            AF: +d.AF,
            AC: +d.AC,
            AY: +d.AY,
            AR: +d.AR,
            matchResults: [],
            Wins: 0,
            Draws: 0,
            Defeats: 0,
            pointsEarned: 0,
            bookingPoints: 0
        }    
        
        
        result[d.AwayTeam] = currentData
        result[d.AwayTeam].AS += +d.AS
        result[d.AwayTeam].AST += +d.AST
        result[d.AwayTeam].AG += +d.FTAG
        result[d.AwayTeam].AF += +d.AF
        result[d.AwayTeam].AC += +d.AC
        result[d.AwayTeam].AY += +d.AY
        result[d.AwayTeam].AR += +d.AR
        result[d.AwayTeam].bookingPoints = (10 * result[d.AwayTeam].AY + 25 *  result[d.AwayTeam].AR)
        result[d.AwayTeam].matchResults.push(d.FTR)
        result[d.AwayTeam].Wins = result[d.AwayTeam].matchResults.reduce(function(n, val){
            return n + (val === "A")

        }, 0)
        result[d.AwayTeam].Draws = result[d.AwayTeam].matchResults.reduce(function(n, val){
            return n + (val === "D")

        }, 0)
        result[d.AwayTeam].Defeats = result[d.AwayTeam].matchResults.reduce(function(n, val){
            return n + (val === "H")

        }, 0)
        result[d.AwayTeam].pointsEarned = (3 * result[d.AwayTeam].Wins + result[d.AwayTeam].Draws) 

       
        return result;

    }, {})

   

    result = Object.keys(result).map(key => result[key])
    result = result.sort(d3.descending)

    return result
    
}

function combineTeamData(data){
    let homeTeams = groupByHomeTeam(store.teams)
    let awayTeams = groupByAwayTeam(store.teams)
 
    let res = []
        for (i = 0; i < 20; i++){
            for (j = 0; j < 20; j++){
                if (homeTeams[i].HomeTeam === awayTeams[j].AwayTeam){
                    homeTeams[i].Wins += awayTeams[j].Wins
                    homeTeams[i].Draws += awayTeams[j].Draws
                    homeTeams[i].Defeats += awayTeams[j].Defeats
                    homeTeams[i].HS += awayTeams[j].AS
                    homeTeams[i].HST += awayTeams[j].AST
                    homeTeams[i].HG += awayTeams[j].AG
                    homeTeams[i].HF += awayTeams[j].AF
                    homeTeams[i].HY += awayTeams[j].AY
                    homeTeams[i].HR += awayTeams[j].AR
                    homeTeams[i].bookingPoints += awayTeams[j].bookingPoints
                    homeTeams[i].matchResults =  homeTeams[i].matchResults.concat(awayTeams[j].matchResults)
                    homeTeams[i].pointsEarned += awayTeams[j].pointsEarned
                    res.push(homeTeams[i])
                }
            }
        }
        

    res = Object.keys(res).map(key => res[key])
    res = res.sort(d3.descending)
    

    return res
}


function showData(){
    let teams = store.teams
   

    let homeTeams = groupByHomeTeam(store.teams)
    let awayTeams = groupByAwayTeam(store.teams)
    let combinedData = combineTeamData(store.teams)

    console.log(homeTeams)
    console.log("-----")
    console.log(awayTeams)
    console.log("-----")
    console.log(combinedData)

    drawTeamsChart(teams)

}
loadData().then(showData)

function drawTeamsChart(teams){
    let config = getChartConfig();
    let scales = getTeamScoreWinScales(teams, config)
    drawBarsHomeTeamsChart(teams, scales, config)
    drawBarsAwayTeamsChart(teams, scales, config)
    drawAxesTeamChart(teams, scales, config)
}

function getChartConfig(){
    let width = 350;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 130,
        right: 10
    }

    let bodyHeight = height - margin.top - margin.bottom
    let bodyWidth = width - margin.left - margin.right


    let container = d3.select("#TeamList")
    container.attr("width", width)
    container.attr("height", height)
    

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getTeamScoreWinScales(teams, config){
    let { bodyWidth, bodyHeight } = config;

    let result = groupByHomeTeam(teams)

    var maxHomeWins = d3.max(result, d => d.Wins + 4)

    let xScale = d3.scaleLinear()
        .range([0, bodyWidth])
        .domain([0, maxHomeWins])

    let yScale = d3.scaleBand()
        .range([0, bodyHeight])
        .domain(teams.map(a => a.HomeTeam)) //The domain is the list of teams at their home field
        .padding(0.2)    

    return {xScale, yScale}
}
function drawBarsAwayTeamsChart(teams, scales, config){
    let {margin,container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
      .style("transform", 
        `translate(${margin.left}px,${margin.top}px)`
      )


  let result = groupByAwatTeam(teams)
  let bars = body.selectAll(".bar").data(result)

  
  

  console.log(result[0].AwayTeam)

  bars.enter().append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", (d) => yScale(d.AwayTeam))
      .attr("width",(d) => xScale(d.Wins))
      //.attr("width", (d) => xScale(d.value))
      //TODO: set the width of the bar to be proportional to the airline count using the xScale
      .attr("fill", "#2a5599")
      
    
}
function drawBarsAwayTeamsChart(teams, scales, config){
    let {margin,container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
      .style("transform", 
        `translate(${margin.left}px,${margin.top}px)`
      )


  let result = groupByAwayTeam(teams)
  let bars = body.selectAll(".bar").data(result)

  
  

  console.log(result[0].AwayTeam)

  bars.enter().append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", (d) => yScale(d.AwayTeam))
      .attr("width",(d) => xScale(d.Wins))
      //.attr("width", (d) => xScale(d.value))
      //TODO: set the width of the bar to be proportional to the airline count using the xScale
      .attr("fill", "#6a5599")
      
    
}

function drawBarsHomeTeamsChart(teams, scales, config){
    let {margin,container} = config;
    let {xScale, yScale} = scales
    let body = container.append("g")
      .style("transform", 
        `translate(${margin.left}px,${margin.top}px)`
      )


  let result = groupByHomeTeam(teams)
  let bars = body.selectAll(".bar").data(result)

  
  

  console.log(result[0].HomeTeam)

  bars.enter().append("rect")
      .attr("height", yScale.bandwidth())
      .attr("y", (d) => yScale(d.HomeTeam))
      .attr("width",(d) => xScale(d.Wins))
      //.attr("width", (d) => xScale(d.value))
      //TODO: set the width of the bar to be proportional to the airline count using the xScale
      .attr("fill", "#2a5599")
    
}

function drawAxesTeamChart(airlines, scales, config){
  let {xScale, yScale} = scales
  let {container, margin, height} = config;
  let axisX = d3.axisBottom(xScale)
                .ticks(5)
  container.append("g")
    .style("transform", 
        `translate(${margin.left}px,${height - margin.bottom}px)`
    )
    .call(axisX)
  let axisY = d3.axisLeft(yScale)
                    .ticks(5)
  //d3.axisLeft(yScale) //TODO: Create an axis on the left for the Y scale
  //TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.
  container.append("g")
    .style("transform", 
        `translate(${margin.left}px,${margin.top}px)`
    )
    .call(axisY)
}

