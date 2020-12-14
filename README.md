## References
	HTML/CSS/JS: https://www.w3schools.com/
	React: https://reactjs.org/docs/getting-started.html
	Antd: https://3x.ant.design/docs/react/introduce
	PouchDB: https://pouchdb.com/api.html#overview
	Electron: https://www.electronjs.org/docs

## Install
1. install Node.js & npm(https://nodejs.org/en/)
2. run "npm install" under the project folder
3. run "npm run start" to run the app in the development mode, and
open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## Form Types
	"general": the most simple one. A simple form
	"dynamic": a dynamic form which can duplicate the sub form
	"multi-dynamic": multiple dynamic forms
	"mixed": mix of a general form and a dynamic form
	"mixed-multi-dynamic"： mix of a general from and a multi-dynamic form
	"nested": nested dynimic forms
	"files": upload/manage files

## How to create a new form
1. go to /src/tabs/form_list
2. add the form group to "FORM_GROUP_MAP", if it belongs to a new group
3. add the form name to "FORM_NAME_MAP" following the same format
	main: { // key of the form group
        basic_info: { // path of the form, which is also used to store the data
            name: "基本信息", // name of the form
            component: Patient, // component, imported on the top. UpperCase
        },
       	...
    }
4. create a new form group under "tabs" if not exists
5. copy a similar form to this form group folder
6. rename the component name and modify the "createFields()"
7. import and export this new form in "index.js" under this form group
8. import this new form in "/src/tabs/form_list"

Note:
1. if the field is time（HH：mm:ss), ensure it has been added toSPECIAL_TIME_FIELDS_WITH_FORMATS
2. if the field contains "'日期','时间' but is a number",  ensure it has been added SPECIAL_TIME_FIELDS_WITH_FORMATS


### Dynamic Forms

## auto bindings
type 1: 'date'
	1. add this "bindings" (Array) to the field
	2. type can be 'years', 'months', 'days', 'hours', 'minutes', 'seconds'

	bindings: [
	    { // result = latter - former
	        type: 'months',
	        latter: '评估日期',
	        former: formerValue,
	        result: '评估间隔（月）',
	    },
	    { // result = latter - former
	        type: 'months',
	        latter: '评估日期',
	        former: formerValue,
	        result: '评估年龄（月）',
	    }
	],

type 2: 'formula'
	1. add this "bindings" (Array) to the field
	2. type is 'formula'

	// result = coeff * former + const
	bindings: [
        {
            type: 'formula',
            coeff: 7.5,
            const: 0,
            former: currentFieldName,
            result: targetFieldName,
        },
    ]

## General Forms






This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
