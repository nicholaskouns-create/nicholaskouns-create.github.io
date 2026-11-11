// Melanie E47 exact spectral research instrument. No model calls.
export const sectors = Object.freeze([
  {j:0,m:1},{j:1,m:3},{j:2,m:5},{j:3,m:4},
  {j:4,m:3},{j:5,m:2},{j:6,m:1}
]);
export function certificate(){
 const spectrum=sectors.map(({j,m})=>({spin:j,multiplicity:m,casimir:j*(j+1),dimension:m*(2*j+1),selected:j===2||j===5}));
 const carrier=spectrum.reduce((s,x)=>s+x.dimension,0);
 const selected=spectrum.filter(x=>x.selected).reduce((s,x)=>s+x.dimension,0);
 const commutant=sectors.filter(x=>x.j===2||x.j===5).reduce((s,x)=>s+x.m*x.m,0);
 const rejected=spectrum.filter(x=>!x.selected).map(x=>({...x,k:(x.casimir-6)*(x.casimir-30)}));
 const k2=rejected.map(x=>x.k*x.k);
 const epsilon=1/99144;
 const q=Math.max(...k2.map(x=>Math.abs(1-epsilon*x)));
 return {carrier,selected,complement:carrier-selected,commutant,omega:`${selected}/${carrier}`,epsilon,contraction:q,spectrum,
  pass:carrier===125&&selected===47&&commutant===29&&Math.abs(q-15/17)<1e-12};
}
export function residualBound(n,initialResidual=1){
 if(!Number.isSafeInteger(n)||n<0||n>1000000)throw Error('Invalid iteration');
 if(!Number.isFinite(initialResidual)||initialResidual<0)throw Error('Invalid residual');
 return initialResidual*Math.pow(15/17,n);
}
