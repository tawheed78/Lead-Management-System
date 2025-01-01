const config = {
    BASE_URL: 'https://lead-management-app-backend.onrender.com/api',
  };
  


  function formatDate(dateString) {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);

    return `${day} ${month}, ${year}`;
  }

  export {formatDate, config};