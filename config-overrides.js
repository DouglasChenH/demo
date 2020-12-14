const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
  	fixBabelImports('import', {
    	libraryName: 'antd',
    	libraryDirectory: 'es',
    	style: true,
  	}),
  	addLessLoader({
  		lessOptions: {
	   		javascriptEnabled: true,
	   		modifyVars: {
	   			'@primary-color': '#00a1b1', // primary color for all components
	   			// '@primary-1': '#00a1b1', // primary color for all components
	   			// '@primary-2': '#00a1b1', // primary color for all components
				'@link-color': '#00a1b1', // link color
				'@success-color': '#f88c26', // success state color
				'@warning-color': '#faad14', // warning state color
				'@error-color': '#f5222d', // error state color
				'@font-size-base': '14px', // major text font size
				'@heading-color': 'rgba(0, 0, 0, 0.85)', // heading text color
				'@text-color': 'rgba(0, 0, 0, 0.65)', // major text color
				'@text-color-secondary' : 'rgba(0, 0, 0, .45)', // secondary text color
				'@disabled-color' : 'rgba(0, 0, 0, .25)', // disable state color
				'@border-radius-base': '4px', // major border radius
				'@border-color-base': '#ddd', // major border color
				'@border-width-base': '2px', // width of the border for a component
				'@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // major shadow for layers
	   		},
	   	}
 	}),
 );