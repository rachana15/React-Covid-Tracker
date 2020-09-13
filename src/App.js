import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  Select,
  FormControl,
  Card,
  CardContent
} from "@material-ui/core";
import Infobox from "./Infobox";
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util.js";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

//https://disease.sh/v3/covid-19/countries

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("Worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.9046, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async event => {
    const countryCode = event.target.value;
    console.log(countryCode);

    const url =
      countryCode === "Worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
        setCountry(countryCode);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };
  console.log(countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1> Covid-19 Tracker </h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              {/* Loop through all the countries and display in dropdown */}
              <MenuItem value="Worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}> {country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <Infobox
            onClick={e => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <Infobox
            active={casesType === "recovered"}
            onClick={e => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <Infobox
            onClick={e => setCasesType("deaths")}
            isRed
            title="Deaths"
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
          {/* Info Boxes*/}
          {/* Info Boxes*/}
          {/* Info Boxes */}
        </div>
        {/* Header*/}

        {/* Title + dropdown */}

        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />
        {/* Map */}
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by country </h3>
          <Table countries={tableData} />
          <h3>Worldwide new {casesType}</h3>
        </CardContent>
        {/* Table */}
        <LineGraph casesType={casesType} />
        {/* Graph */}
      </Card>
    </div>
  );
}

export default App;
