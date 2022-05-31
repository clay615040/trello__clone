

export default {
  sort_date: (data, key, asc)=> {
    data.sort((a, b) => {   console.log(a[key])
      return new Date(b[key]) - new Date(a[key])
    })
    return data
  },
  format_number: (number, point)=> {
    return parseFloat(number).toFixed(point).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },
}

