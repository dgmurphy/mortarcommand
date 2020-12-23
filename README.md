## Mortar Command  

Desktop web game using BabylonJS
[http://mortarcommand.com](http://mortarcommand.com)

![Screenshot](./screenshot.png?raw=true)

## How to use
Clone this repository, then run
### `npm install`
### `npm start`


## The Making Of
This is a React web app using Babylon.js as the 3D rendering engine.  Babylon has lots of good 
documentation and examples.

The terrain mesh (California desert) was created by getting geotiff data from the USGS Earth Explorer site. QGIS
was used to crop the raw tiff and gdalwarp was used to convert the tif to a format that
the Tin-Terrain utility likes (Web Mercator projection EPSG:3857 and 'square pixel' aspect
ratio). Tin-Terrain converted the tiff to an optimized triangulated mesh in obj format, and
Blender was used to add the satellite imagery and export as gltf.  This conversion was a 
bit of a hassle because the input obj has some very odd scaling and position values. I 
re-exported the obj as STL to make sure the corrected vertex values were baked in before
re-exporting as gltf.

Once loaded into the Babylon scene,  the scaling needed to be fixed due to the BJS
handed coordinate system. The normals had to be flipped also.  All the other objects
are BJS primitives from the provided polyhedra examples.


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


### `npm run build-web`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

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
