import "unirest";

    export const runIt = async (chall, input, startTime) => {

        var j = 0;
        var str2 = ''; 
        var str3 = input;
        const timeElapsed = new Date().getTime() - startTime;

        //Building the main method that will be used to invoke the user made method, and adding an import of Scanner at the beginning
        

        var str1 = '\tpublic static void main(String[] args){\n';

        var w = 0;
        var str5 = '';
        var userOutputs = '';
        var userOutputsCorrect = {};
        var correct = true;
        var userOutputsSplit ={};
        var numCorrect = 0;
        var runTime = 0;
        var memory = 0;
        console.log(chall);
        var {challenge} = chall.challenge;


        for(var j = 0; j <challenge.inputs.length; j++){
            str1 = str1 + "\t\tSystem.out.println(" + challenge.methodName + "(";
            for(var k = 0; k<challenge.inputs[j].length; k++){
                str1 = str1 + challenge.inputs[j][k];
                if(k<challenge.inputs[j].length-1)
                    str1= str1 + ', ';
            }
            str1 = str1 + "));\n";
        }
        str1 = str1 + "\t}\n";



        while(str3.length>0){
            w = str3.indexOf('\n');
            if(str3.indexOf("public class Main")!==0){      //Toss a main method in there that calls the input method and passes into it the subject input
                str2 = str2 + str3.substring(0, w+1);
                str3 = str3.substring(w+1, str3.length);
            }
            else{
                str2 = str2 + "\n" + challenge.dataStructure + "\n" + str3.substring(0, w+1);
                str3 = str3.substring(w+1, str3.length);
                str2 = str2.concat(str1, str3);
                break;
            }
        }  
        
        console.log(str2);

        const response = await fetch(
            "https://judge0-extra.p.rapidapi.com/submissions",
            {
                method: "POST",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                    "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                    "content-type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify({
                    source_code: str2,
                    language_id: 62
                }),
                }
            
            );
            
            const jsonResponse = await response.json();
            

            let jsonGetSolution ={
                status: { description: "Queue" },
                stderr: null,
                compile_output: null
            };


            while(
                (jsonGetSolution.status.description!== "Accepted"&&
                jsonGetSolution.stderr == null &&
                jsonGetSolution.compile_output == null)
            ) {
                if(jsonResponse.token){

                    let url = `https://judge0-extra.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;
                    
                    const getSolution = await fetch(url, {
                        method: "GET",
                        headers: {
                            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                            "x-rapidapi-key": "e51bc475ffmshb688bd7febd7bdap175735jsn486eb27febcb", 
                            "content-type": "application/json",
                          },
                    });

                    jsonGetSolution = await getSolution.json();
                }
            }

            if(jsonGetSolution.stdout){
                userOutputs = atob(jsonGetSolution.stdout);
                runTime = jsonGetSolution.time;
                memory = jsonGetSolution.memory;

                userOutputsSplit = userOutputs.split("\n");
                
                for(var t = 0; t<userOutputsSplit.length; t++){
                    if(userOutputsSplit[t] === challenge.outputs[t]){
                        userOutputsCorrect[t] = true;
                        numCorrect++;
                    
                    }    
                    else{
                    
                        correct = false;
                        userOutputsCorrect[t] = false;
                    }
                }
                str2 = "You passed " + numCorrect + "/" + challenge.inputs.length + " cases, and it took you " + (timeElapsed/1000) + " seconds. The run time was " + runTime + " ms and you used " + memory + " KB of memory!\n" + "Did all test cases pass?: " + correct +"\n---------------------------------------\n";
    
    
                for(var j = 0; j<challenge.outputs.length; j++){
                    str2 = str2 + "Input(s): " + challenge.inputs[j] + "\nYour Output: " + userOutputsSplit[j] + "\nExpected Output: " + challenge.outputs[j] + "\nOutput correct?: " + userOutputsCorrect[j] + "\n-------------------------------------------\n";
                }
            }    
            else if(jsonGetSolution.stderr){
                userOutputs = atob(jsonGetSolution.stderr);
                str2 = userOutputs;
                correct = false;
            }
    
            else{
                userOutputs = atob(jsonGetSolution.compile_output);
                str2 = userOutputs;
                correct = false;
            }
        
        return str2;
    }
