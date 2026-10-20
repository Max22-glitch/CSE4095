import type { Question,MathOperation,DifficultyLevel } from '../types/question';
const symbols:Record<MathOperation,string>={addition:'+',subtraction:'−',multiplication:'×',division:'÷'};
const random=(lo:number,hi:number)=>Math.floor(Math.random()*(hi-lo+1))+lo;
const shuffle=<T,>(arr:T[])=>[...arr].sort(()=>Math.random()-.5);
export function generateQuestion(operation:MathOperation,difficulty:DifficultyLevel,source:'regular'|'mistake-review'='regular',near?:{firstOperand:number;secondOperand:number}):Question{
 const limits=[0,10,20,100,500];const max=limits[difficulty];
 let a=near?Math.max(0,near.firstOperand+random(-2,2)):random(0,max);
 let b=near?Math.max(0,near.secondOperand+random(-2,2)):random(0,max);
 let answer=0;
 if(operation==='addition')answer=a+b;
 if(operation==='subtraction'){if(a<b)[a,b]=[b,a];answer=a-b;}
 if(operation==='multiplication'){a=random(0,Math.min(max,difficulty===4?30:12));b=random(0,Math.min(max,difficulty===4?30:12));answer=a*b;}
 if(operation==='division'){const divisor=random(1,Math.min(max,difficulty===4?25:12));const quotient=random(0,Math.min(max,difficulty===4?25:12));a=divisor*quotient;b=divisor;answer=quotient;}
 const answers=new Set<number>([answer]);let tries=0;
 while(answers.size<4&&tries++<200){const delta=random(1,Math.max(5,Math.ceil(Math.abs(answer)*.3)));const candidate=answer+(Math.random()<.5?-delta:delta);if(candidate>=0)answers.add(candidate);}
 for(let i=1;answers.size<4;i++)answers.add(answer+i);
 return {id:crypto.randomUUID(),operation,firstOperand:a,secondOperand:b,displayText:`${a} ${symbols[operation]} ${b} = ?`,correctAnswer:answer,choices:shuffle([...answers]),difficulty,source};
}
export const operations:MathOperation[]=['addition','subtraction','multiplication','division'];
export const labels:Record<MathOperation,string>={addition:'Addition',subtraction:'Subtraction',multiplication:'Multiplication',division:'Division'};
export const icons:Record<MathOperation,string>={addition:'+',subtraction:'−',multiplication:'×',division:'÷'};
