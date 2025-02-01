import fs from 'fs';
import { parse } from 'papaparse';
import { DOMParser, XMLSerializer } from 'xmldom';
import { exec, execSync } from 'child_process';
import path from 'path';

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
const referenceFilePath = 'reference-card.png'; // Path to the reference file

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
    

    //  // Write the updated SVG to a file
    const outputSvgPath = `${outputDir}/card_${route.id}.svg`;
    
    // Export the SVG to PNG using Inkscape CLI
    const outputPngPath = `${outputDir}/card_${route.id}.pdf`;
    let message=`Exported: ${outputPngPath}`;
    try {
        execSync(
            `${inkscapePath} ${outputSvgPath} --export-background=#ffffff --export-background-opacity=1 --export-dpi=300 --export-type=pdf --export-filename=${outputPngPath}`,
            
        );
    }catch(error){
        message=`Error exporting : ${error.message}`
    }
     console.log(message)
    
})