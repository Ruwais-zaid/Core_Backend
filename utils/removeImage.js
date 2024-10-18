import fs from 'fs'

import path from 'path'

export const removeImage = (imagename)=>{
    try{
        const imagePath = path.join(process.cwd() ,"public","images",imagename);

        if(fs.existsSync(imagePath)){
            fs.unlinkSync(imagePath)
            console.log("Image " , imageName,"remove Sucessfuly")
        }
        else{
            console.log("Image ",imagename,"is not remove Sucessfuly")
        }
    }catch(error){
        console.log(error)
    }
}