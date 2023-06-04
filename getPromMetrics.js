const axios = require('axios');
require('dotenv').config();

// Function to fetch Prometheus metrics from SonarQube
const getPromMetrics = async () => {
  try {
    const SONARQUBE_PASSWORD = process.env.SONARQUBE_PASSWORD;
    const response = await axios.get('http://127.0.0.1:9000/api/monitoring/metrics', {
      auth: {
        username: "admin",
        password: SONARQUBE_PASSWORD,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Prometheus metrics:', error.response);
    throw error;
  }
};

module.exports = getPromMetrics;