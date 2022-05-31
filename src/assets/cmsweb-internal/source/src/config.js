var nodeEnv = process.env.NODE_ENV;
var hostApi;

if(nodeEnv == 'STAGE') hostApi = 'https://qc-gamerapi.aug888.com';
else if(nodeEnv == 'QC') hostApi = 'https://qc-gamerapi.aug888.com';
else if(nodeEnv == 'ONLINE') hostApi = 'https://gamerapi.aug888.com';
else hostApi = 'http://localhost:3000';

const baseURLApi = hostApi;

if(nodeEnv != 'ONLINE') console.log(process.env.NODE_ENV, ':', baseURLApi);

export default {
  hostApi,
  baseURLApi,  
  isBackend: true, 
  auth: {
    username: '',
    password: ''
  },
  app: {
    sidebarTransitionTime: 300, //ms
    colors: {
      sidebar: "#002B49",
      navbar: "#ffffff",
      primary: "#005792",
      secondary: "#798892",
      success: "#21AE8C",
      info: "#1A86D0",
      warning: "#FDA700",
      danger: "red",
      inverse: "#002B49",
      textColor: "#495057",
      gray: "#D7DFE6",     
    },
    themeColors: [
      ['default','#002B49'],
      ['white', '#FFFFFF'],
      ['first','#004472'],
      ['second','#e9ebef'],
      ['third','#d1e7f5'],
      ['fourth','#ccdde9'],
      ['fifth','#d6dfe6'],
      ['sixth','#13191d'],
      ['seventh','#20ae8c'],
    ],
    chartColors: {
      axisColor: '#8EA1AB'
    }
  }
};
