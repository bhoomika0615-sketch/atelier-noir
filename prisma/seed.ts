import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma=new PrismaClient();
async function main(){
 const email=process.env.INITIAL_ADMIN_EMAIL?.toLowerCase();
 const password=process.env.INITIAL_ADMIN_PASSWORD;
 if(!email||!password||password.length<16)throw new Error("Set INITIAL_ADMIN_EMAIL and a unique INITIAL_ADMIN_PASSWORD of at least 16 characters.");
 const passwordHash=await bcrypt.hash(password,12);
 await prisma.user.upsert({where:{email},update:{passwordHash,role:"SUPER_ADMIN"},create:{email,name:"Atelier Noir Administrator",passwordHash,role:"SUPER_ADMIN"}});
 const count=await prisma.product.count();
 if(count===0){
  const products=[
   {slug:"structured-wool-coat",name:"Structured Wool Coat",description:"A considered outer layer with a clean architectural silhouette and a soft, substantial hand feel.",category:"Outerwear",pricePaise:249900,featured:true,images:[{url:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",alt:"Editorial long coat"}],sizes:["S","M","L","XL"]},
   {slug:"relaxed-tailored-trouser",name:"Relaxed Tailored Trouser",description:"A fluid tailored trouser designed for movement, balance and everyday refinement.",category:"Tailoring",pricePaise:89900,featured:true,images:[{url:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",alt:"Modern tailored outfit"}],sizes:["30","32","34","36"]},
   {slug:"heavyweight-cotton-shirt",name:"Heavyweight Cotton Shirt",description:"An elevated essential cut from substantial cotton with a relaxed, deliberate proportion.",category:"Essentials",pricePaise:69900,featured:false,images:[{url:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85",alt:"Minimal cotton shirt"}],sizes:["S","M","L","XL"]},
   {slug:"minimal-leather-jacket",name:"Minimal Leather Jacket",description:"A restrained statement piece with clean lines and a timeless profile.",category:"Outerwear",pricePaise:329900,featured:true,images:[{url:"https://images.unsplash.com/photo-1520975958225-3f61d5b6b5a9?auto=format&fit=crop&w=1000&q=85",alt:"Dark leather outerwear"}],sizes:["S","M","L"]}
  ];
  for(const p of products){const {sizes,images,...data}=p;await prisma.product.create({data:{...data,published:true,images:{create:images},variants:{create:sizes.map(size=>({size,color:"Black",stock:10,sku:`AN-${p.slug.toUpperCase().slice(0,8)}-${size}`}))}}});}
 }
}
main().finally(()=>prisma.$disconnect());