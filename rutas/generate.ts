import fs from 'fs';
import { parse } from 'papaparse';
import { DOMParser, XMLSerializer } from 'xmldom';
import { exec, execSync } from 'child_process';
import path from 'path';
import {MatrixPoints} from './matrix-points';
type Route = {
    id: string,
    weight: string,
    sourceName: string,
    destName: string
};

// Paths
const templateSvgPath = './ticket-to-ride-card-template.svg'; // Path to your Inkscape SVG template
const longTemplateSvgPath = './ticket-to-ride-card-long-template.svg'; // Path to your Inkscape SVG template
const csvFilePath = './rutas/suggested_routes.csv'; // Path to your CSV file
const outputDir = 'output_cards'; // Directory to save output SVGs/PNGs
const inkscapePath = 'inkscape'; // Ensure Inkscape CLI is installed and available
const referenceFilePath = 'ticket-to-ride-reference.png'; // Path to the reference file

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// Copy the reference card to the output folder
const copiedReferencePath = path.join(outputDir, path.basename(referenceFilePath));
fs.copyFileSync(referenceFilePath, copiedReferencePath);
console.log(`Copied reference card to: ${copiedReferencePath}`);

const csvInput = fs.readFileSync(csvFilePath, { encoding: "utf-8" })

const { data } = parse<Route>(csvInput, { header: true });

data.forEach((route) => {
    // Read the SVG template
     const fileName=parseInt(route.weight)>=19?longTemplateSvgPath:templateSvgPath;
     const svgTemplate = fs.readFileSync(fileName, 'utf-8');

     // Parse the SVG into a DOM
     const doc = new DOMParser().parseFromString(svgTemplate, 'application/xml');

     // Replace placeholders in the SVG
     const replaceText = (placeholder: string, value: string) => {
         const elements = doc.getElementsByTagName('text');
         for (let i = 0; i < elements.length; i++) {
             if (elements[i].textContent?.trim() === placeholder) {
                 elements[i].textContent = value;
             }
         }
     };

     replaceText('{sourceName}', route.sourceName);
     replaceText('{destName}', route.destName);
     replaceText('{w}', route.weight);
     doc.getElementById('use14')?.setAttribute("transform",MatrixPoints[route.sourceName]);
     doc.getElementById('use15')?.setAttribute("transform",MatrixPoints[route.destName]);
     
    // Serialize the updated SVG back to a string
     const updatedSvg = new XMLSerializer().serializeToString(doc);

    //  // Write the updated SVG to a file
    const outputSvgPath = `${outputDir}/card_${route.id}.svg`;
     fs.writeFileSync(outputSvgPath, updatedSvg);
    // Export the SVG to PNG using Inkscape CLI
    const outputPngPath = `${outputDir}/card_${route.id}.png`;
    let message=`Exported: ${outputPngPath}`;
    try {
        execSync(
            `${inkscapePath} ${outputSvgPath} --export-background=#ffffff --export-background-opacity=1 --export-dpi=300 --export-type=png --export-filename=${outputPngPath}`,
            
        );
    }catch(error){
        message=`Error exporting : ${error.message}`
    }
     console.log(message)
    
})