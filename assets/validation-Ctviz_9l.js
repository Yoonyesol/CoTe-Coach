import{c as r}from"./index-CIOTfCGo.js";/**
 * @license lucide-react v0.476.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],i=r("Lock",n),e=/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/,o=t=>!(t.length<8||!e.test(t)),c=t=>t?t.length<8?"비밀번호는 최소 8자 이상이어야 합니다.":e.test(t)?"":"영문, 숫자, 특수문자를 각각 최소 하나씩 포함해야 합니다.":"비밀번호를 입력해 주세요.",s=/^[^\s@]+@[^\s@]+\.[^\s@]+$/,u=t=>t?s.test(t)?"":"올바른 이메일 형식이 아닙니다.":"이메일을 입력해 주세요.";export{i as L,o as a,c as g,u as v};
