  var rows = document.getElementById("table_data").rows.length;
  var arr_data1 = new Array()
  for (var i = 0; i < rows; i++) {
    arr_data1.push([i + 1, document.getElementById("table_data").rows[i].cells[0].innerHTML])
  }

  var chart_plot_03_data = new Array()
  for (var i = 0; i < rows; i++) {
    chart_plot_03_data.push([i + 1, document.getElementById("table_data").rows[i].cells[1].innerHTML])
  }

  var chart_plot_01_settings = {
    series: {
      lines: {
        show: true,
      },
      splines: {
        show: false,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 3,
        show: true
      },
      shadowSize: 2
    },
    colors: ["#26B99A"],
    grid: {
      borderWidth: {
        top: 0,
        right: 0,
        bottom: 1,
        left: 1
      },
      borderColor: {
        bottom: "#7F8790",
        left: "#7F8790"
      }
    }
  }

  var chart_plot_03_settings = {
    series: {
      lines: {
        show: true,
        fill: true
      },
      splines: {
        show: false,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.4
      },
      points: {
        radius: 3,
        show: true
      },
      shadowSize: 2
    },
    colors: ["#26B99A"],
    grid: {
      borderWidth: {
        top: 0,
        right: 0,
        bottom: 1,
        left: 1
      },
      borderColor: {
        bottom: "#7F8790",
        left: "#7F8790"
      }
    }
  };


  if ($("#chart_plot_01").length) {
    console.log('Plot1');
    $.plot($("#chart_plot_01"), [arr_data1], chart_plot_01_settings);
  }

  if ($("#chart_plot_03").length) {
    console.log('Plot3');
    $.plot($("#chart_plot_03"), [{
      label: "Registrations",
      data: chart_plot_03_data,
      lines: {
        fillColor: "rgba(150, 202, 89, 0.12)"
      },
      points: {
        fillColor: "#fff"
      }
    }], chart_plot_03_settings);

  };