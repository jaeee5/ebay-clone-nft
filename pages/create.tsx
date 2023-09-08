import React, { FormEvent, useState } from 'react'
import Header from '../components/Header'
import { 
    MediaRenderer,
    useAddress,
    useContract,
    useNetwork,
    useNetworkMismatch,
    useOwnedNFTs,
    useCreateAuctionListing,
    useCreateDirectListing
} from "@thirdweb-dev/react"
import { Router, useRouter } from 'next/router';
import { ListingType, NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from '@thirdweb-dev/sdk';
import network from '../utils/network';
import toast, { Toaster } from 'react-hot-toast';

type Props = {}

function Create({}: Props) {

    const address = useAddress();
    const router = useRouter();
    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        "marketplace"
    );

    const { contract: collectionContract } = useContract(
        process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
        "nft-collection"
    );

    const [selectedNft, setSelectedNft] = useState<NFT>();

    //address is owner that is signed in
    const ownedNfts = useOwnedNFTs(collectionContract, address);

    console.log("Address:", address);
    console.log("OwnedNFTs:", ownedNfts);

    const networkMismatch = useNetworkMismatch();
    const [, switchNetwork] = useNetwork();

    const {
        mutate: createDirectListing,
        isLoading,
        error,
    } = useCreateDirectListing(contract);

    const { 
        mutate: createAuctionListing, 
        isLoading :isLoadingAuction, 
        error: errorAuction, 
    } = useCreateAuctionListing(contract);

    const notifyError = () => {
        toast.dismiss();
        toast.error('Unable to create listing!');
    };
    const notifySuccess = () => {
        toast.dismiss();
        toast.success('Listing Created Successfully!');
    };
    // This function gets called when the form is submitted
    // The user has provided:
    // - contract address
    // - token id
    // - type of listing (eother auction or direct)
    // - prie of the NFT
    // - This function gets called when the form is submitted
    const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        //if (!contract || address) return;

        if (networkMismatch) {
            switchNetwork && switchNetwork(network)
        }

        if (!selectedNft) return toast.error('Please Select an NFT');

        const target = e.target as typeof e.target & {
            elements: { listingType: { value: string }, price: { value: string }};
        };

        const {listingType, price} = target.elements;

        //assetContractAddress is the collection address we are going to mint from
        //tokenID is how it is stored in the collection, the token id
        if (listingType.value === "directListing") {
            toast.loading("Listing...",{
                id:'dList',
            })
            createDirectListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNft.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
                quantity: 1,
                buyoutPricePerToken: price.value,
                startTimestamp: new Date()
            }, {
                onSuccess(data, variables, context) {
                    notifySuccess();
                    console.log('SUCCESS: ', data, variables, context);
                    router.push('/');
                },
                onError(error, variables, context) {
                    notifyError();
                    console.log('ERROR: ', error, variables, context );
                },
            });
        };

        if (listingType.value === "auctionListing") {
            toast.loading("Listing...",{
                id:'aList',
            })
            createAuctionListing({
                assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
                tokenId: selectedNft.metadata.id,
                currencyContractAddress: NATIVE_TOKEN_ADDRESS,
                listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
                quantity: 1,
                buyoutPricePerToken: price.value,
                startTimestamp: new Date(),
                reservePricePerToken: 0
            }, {
                onSuccess(data, variables, context) {
                    notifySuccess();
                    console.log('SUCCESS: ', data, variables, context);
                    router.push('/');
                },
                onError(error, variables, context) {
                    notifyError();
                    console.log('ERROR: ', error, variables, context );
                },
            });
        };
    };


    return (
        <div>
            {/* <Header /> */}
            <Toaster 
                position='top-center'
                reverseOrder={false}
            />
            <main className='max-w-6xl mx-auto p-10 pt-2'>
                <h1 className='text-4xl font-bold'>List an Item</h1>
                <h2 className='text-xl font-semibold pt-5'>Select an Item you would like to Sell</h2>

                <hr className='mb-5'/>

                <p>Below you will find the NFT's you own in your wallet</p>

                <div className='flex overflow-x-scroll space-x-2 p-4'>
                    {ownedNfts?.data?.map((nft) => (
                        <div 
                            key={nft.metadata.id}
                            onClick={() => {setSelectedNft(nft)}}
                            className={`flex flex-col space-y-2 card min-w-fit
                                border-2 bg-gray-100 ${
                                    nft.metadata.id === selectedNft?.metadata.id
                                    ? "border-black"
                                    : "border-transparent"
                                }`}
                        >
                            <MediaRenderer 
                                className='h-48 rounded-lg'
                                src={nft.metadata.image}
                            />
                            <p className='text-lg truncate font-bold'>{nft.metadata.name}</p>
                            <p className='text-xs truncate'>{nft.metadata.description}</p>
                        </div>
                    ))}
                </div>

                {selectedNft && (
                    <form onSubmit={handleCreateListing}>
                        <div className='flex flex-col p-10'>
                            <div className='grid grid-cols-2 gap-5' >
                                <label className='border-r font-light'>Direct Listing / Fixed Price</label>
                                <input 
                                    type="radio" 
                                    name='listingType' 
                                    value='directListing'
                                    className='ml-auto h-10 w-10'
                                />

                                <label className='border-r font-light'>Auction</label>
                                <input 
                                    type="radio" 
                                    name='listingType' 
                                    value='auctionListing'
                                    className='ml-auto h-10 w-10'
                                />

                                <label className='border-r font-light'>Price</label>
                                <input 
                                    type="text" 
                                    name='price'
                                    placeholder='0.05'
                                    className='bg-gray-100 p-5'
                                />
                            </div>

                            <button 
                                className='bg-blue-600 text-white rounded-lg p-4 mt-8'
                                type='submit'
                            >
                                Create Listing
                            </button>
                        </div>
                    </form>
                )}

            </main>
        </div>
    )
}

export default Create