const config = {
    // BASE_URL: 'https://lead-management-app-backend.onrender.com/api',
    BASE_URL: 'https://lead-management-app-backend-v2.onrender.com/api'
    // BASE_URL: 'http://127.0.0.1:8000/api',
  };
  


  function formatDate(dateString) {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);

    return `${day} ${month}, ${year}`;
  }

  export {formatDate, config};