const config = {
    BASE_URL: 'http://13.60.181.166:8000/api',
  };
  


  function formatDate(dateString) {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);

    return `${day} ${month}, ${year}`;
  }

  export {formatDate, config};