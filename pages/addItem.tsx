import React, { FormEvent, useState } from 'react'
import Header from '../components/Header'
import { useAddress, useContract } from "@thirdweb-dev/react"
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';

type Props = {}

function addItem({}: Props) {

    const address = useAddress();
    const router = useRouter();
    const [preview, setPreview] = useState<string>();
    const [image, setImage] = useState<File>();
    const { contract } = useContract(
        process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
        "nft-collection"
    );

    const notifyError = () => toast.error('Unable to Mint NFT!');

    //console.log(contract);
    const mintNft = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!contract || !address) return notifyError();

        if (!image) {
            toast('Please select an image',{
                icon: '📸'
            });
            return;
        }

        const target = e.target as typeof e.target & {
            name: { value: string};
            description: { value: string};
        }

        const metadata = {
            name: target.name.value,
            description: target.description.value,
            image: image,
        }
        console.log(metadata)
        try {
            
            const txx = async() => {
                const tx =  await  contract.mintTo(address, metadata) //tx means transcation

                const receipt = tx.receipt; // the transaction reciept
                const tokenId = tx.id; // the id of the NFT minted
                const nft = tx.data; // (optional) fetch details of the minted NFT 
                router.push("/");
            };
            
            
            toast.promise(
                txx(),
                {
                    loading: 'Minting...',
                    success: <b>NFT Minted Successfully!</b>,
                    error: <b>Unable to Mint NFT!</b>,
                }
            )
            //console.log(receipt, tokenId, nft);
            //router.push("/");
        } catch (error) {
            console.log(error);
            
        }

    }

    return (
        <div>
            {/* <Header /> */}
            <Toaster 
                position='top-center'
                reverseOrder={false}
            />
            <main className='max-w-6xl mx-auto p-10 border'>
                <h1 className='text-4xl font-bold'>Add an Item to the Marketplace</h1>
                <h2 className='text-xl font-semibold pt-5'>Item Details</h2>
                <p className='pb-5'>
                    By adding an item to the marketplace, you're essentially 
                    Minting an NFT of the item into your wallet which we can 
                    then list for sale!
                </p>

                <div className='flex flex-col justify-center items-center
                    md:flex-row md:space-x-5 pt-5
                '>
                    <img 
                        className='border h-80 w-80 object-contain rounded-lg'
                        src={preview || "https://links.papareact.com/ucj"}
                        alt=""
                    />

                    <form 
                        onSubmit={mintNft}
                        className='flex flex-col flex-1 p-2 space-y-2'>
                        <label className='font-light'>Name of Item</label>
                        <input 
                            className='formField' 
                            placeholder='Name of item..' 
                            type="text" 
                            name='name'
                            id='name'
                        />

                        <label className='font-light'>Description</label>
                        <input 
                            className='formField' 
                            placeholder="Enter Description.." 
                            type="text" 
                            name='description'
                            id='description'
                        />

                        <label className='font-light'>Image of the Item</label>
                        <input 
                            type="file" 
                            className='cursor-pointer rounded-sm'
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setPreview(URL.createObjectURL(e.target.files[0]));
                                    setImage(e.target.files[0]);
                                }
                        }}/>

                        <button 
                            type="submit" 
                            className='bg-blue-600 font-bold text-white rounded-full py-4 px-10
                            w-56 mt-5 md:mt-auto mx-auto md:ml-auto
                        '>
                            Add/Mint Item
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default addItem