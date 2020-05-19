import fetchData from "./utils/fetchUtil.js";
import Chart from "chart.js";

const baseEndPoint = 'https://covid-india-cases.herokuapp.com/';
// let corsProxy = 'https://crossorigin.me/';
const totalEl = document.querySelector('.totalCase span');
const recoveredEl = document.querySelector('.recovered span');
const deathEl = document.querySelector('.death span');
const form = document.querySelector('.search');
const selection = form.querySelector('#state');
const updateState = document.querySelector('.data .state')

let ctx = document.querySelector('.timeline').getContext('2d');

let covidDate = [];
let totalCasebyDate = [];
const covidData = {};
let showData 

function updateStat(data){
    updateState.textContent = data[0];
    totalEl.textContent = data[1].currentCase;
    recoveredEl.textContent = data[1].recovered;
    deathEl.textContent = data[1].deaths;

    createGraph(dateby10days(), data[1].caseBy10Days())
}

function changeHandler(e){
    e.preventDefault();
    let change = e.target.value;
    let arrCovidData = Object.entries(covidData);

    for(const val of arrCovidData){
        val.find((ele, idx, arr) => {
            if(ele === change){
                showData = arr
            }
        })
    }

    updateStat(showData)
}

function createOptions(){
    let states = Object.keys(covidData);
    let mapStates = states.map((ele) => {
        return `<option name=${ele.replace(/\s/g,'_')}>${ele}</options>`
    }).join(' ');

    selection.insertAdjacentHTML("beforeend", mapStates)

    selection.addEventListener('change',changeHandler)
}

async function createGraph(labels, data){
    let chartConfig = {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                label: 'Covid 19 Cases',
                data,
                backgroundColor: 'rgba(255, 80, 20, 0.2)',
                borderColor: 'red',
                maintainAspectRatio: false,
                aspectRatio: 1,  
                    }
                ],
            },
        };
        
        let myChart = new Chart(ctx, chartConfig);
    }

    

    const covidDataStateWise = fetchData(`${baseEndPoint}states`);
    const covidDataStateWiseTimeline = fetchData(`${baseEndPoint}statetimeline`);
    
    function addStateData(data){
        for(const val of data){
            covidData[val.state] = {
                'currentCase': val.noOfCases,
                'deaths': val.deaths,
                'recovered': val.cured,
            }
        }
    }
    
    function chartData(){
        let arrOfDatas = [];
        let data;
    
        for(const val in covidData){
            arrOfDatas.push(covidData[val].caseBy10Days())
        }
        
        const len = arrOfDatas[0].length
        data = new Array((len)).fill(0);
    
        
        for(let i=0; i< arrOfDatas.length; i++){
            // console.log(arrOfDatas[i])
            for(let j=0; j< arrOfDatas[i].length; j++){
                data[j] += (arrOfDatas[i][j])
            }
        }
        return data;
    }


function displayIndiaData(data){
    console.log(data)
    let total = 0;
    let death = 0;
    let recovered = 0;
    for(const val of data){
        total += val.noOfCases ;
        death += val.deaths ;
        recovered += val.cured ;
    }
    
    totalEl.textContent = total;
    recoveredEl.textContent = recovered;
    deathEl.textContent = death;
    
    addStateData(data)
    console.log(covidData)
}


function displayIndiaTimeline(data){
    covidDate = [...(Object.keys(data[0]))];
    covidDate.pop();
    for(const value of data){
        totalCasebyDate.push(Object.values(value))
    }

    // console.log(covidDate);
    // console.log(totalCasebyDate);

    for(const value of totalCasebyDate){
        let state = value.pop()

        covidData[state].cases = value;
        covidData[state].caseBy10Days = function(){
                let count = 0;
                let arrof10Cases = [];

                for(const value of this.cases){
                    count++

                    if(count%10 === 0){
                        arrof10Cases.push(value)
                    }
                }

                arrof10Cases.push(this.cases[this.cases.length - 1]);

                return arrof10Cases
            };
        
    }

    createOptions()
    // console.log(Object.keys(covidData));
    // console.log(covidData['Haryana'].dataOf10Cases());
    console.log(covidData['Haryana'].caseBy10Days());

    
    createGraph(dateby10days(), chartData())
    
}

function dateby10days(){
    let count = 0;
    let dateEvery10Day = covidDate.filter((ele) => {
        count++;
        if(count%10 === 0){
            return ele
        }
    })
    let date = Array.from(new Set([...dateEvery10Day,covidDate[covidDate.length-1]]));
    return date;
    // console.log(date)
}

// Promise.all([covidDataStateWise, covidDataStateWiseTimeline]).then(displayIndiaData).then(displayIndiaTimeline).catch((err) => console.log(err))

covidDataStateWise.then(displayIndiaData).catch((err) => console.log(err))

covidDataStateWiseTimeline.then(displayIndiaTimeline).catch((err) => console.log(err))

