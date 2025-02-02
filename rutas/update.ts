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
const csvFilePath = './rutas/suggested_routes.csv'; // Path to your CSV file
const outputDir = 'output_cards'; // Directory to save output SVGs/PNGs
const inkscapePath = 'inkscape'; // Ensure Inkscape CLI is installed and available

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
   throw new Error(`Output directory does not exist: ${outputDir}`);
}

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