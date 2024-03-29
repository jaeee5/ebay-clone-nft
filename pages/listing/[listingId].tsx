import { UserCircleIcon } from '@heroicons/react/24/solid';
import { 
        MediaRenderer, 
        useContract, 
        useListing,
        useNetwork,
        useChain,
        useChainId,
        useSwitchChain,
        useNetworkMismatch,
        useMakeBid,
        useOffers,
        useMakeOffer,
        useBuyNow,
        useAddress,
        useAcceptDirectListingOffer,
    } from '@thirdweb-dev/react';
import { ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header';
import Countdown from 'react-countdown'
import network from '../../utils/network';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

type Props = {}

function ListingPage({}: Props) {

    const router = useRouter();
    const { listingId } = router.query as { listingId: string };
    const [bidAmount, setBidAmount] = useState('');
    const [, switchNetwork] = useNetwork();
    const networkMismatch = useNetworkMismatch();
    const address = useAddress();

    const notifyError = () => {
        toast.dismiss();
        toast.error('Unable to buy NFT');
    };
    const notifySuccess = () => {
        toast.dismiss();
        toast.success('Listing Created Successfully!');
    };

    const [minimumNextBid, setMinimumNextBid] = useState<{
        displayValue: string;
        symbol: string;
    }>();

    const { contract } = useContract(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
        "marketplace"
    );
    const { contract: collectionContract } = useContract(
        process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
        "nft-collection"
    );

    const {data: offers} = useOffers(contract, listingId);

    const {mutate: makeOffer} = useMakeOffer(contract);

    const {mutate: makeBid,} = useMakeBid(contract);

    const {
        mutate: buyNow,
        isLoading: isLoadingBuyNow,
        error: errorBuyNow,
    } = useBuyNow(contract);

    const { 
        data: listing, 
        isLoading, 
        error 
    } = useListing(contract, listingId);

    const { mutate: acceptOffer} = useAcceptDirectListingOffer(contract);

    useEffect(() => {
        if (!listingId || !contract || !listing) return;

        if (listing.type === ListingType.Auction) {
            fetchMinNextBid();
        }

    }, [listing, listingId, contract]);

    // console.log(minimumNextBid)

    const fetchMinNextBid = async () => {
        if (!listingId || !contract) return;

        const { displayValue, symbol } = await contract.auction.getMinimumNextBid(listingId);

        setMinimumNextBid({
            displayValue: displayValue,
            symbol: symbol,
        });
    };

    const formatPlaceholder = () => {
        if (!listing) return;

        if (listing.type === ListingType.Direct) {
            return "Enter Offer Amount";
        }

        if (listing.type === ListingType.Auction) {
            return Number(minimumNextBid?.displayValue) === 0
                ? "Enter Bid Amount"
                : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;
        }
    };

    const buyNft = async () => {
        
        if (networkMismatch) {
            switchNetwork && switchNetwork(network);
            return;
        }
    
        if (!listingId || !contract || !listing) return notifyError();

        toast.dismiss();
        toast.loading("Buying...");
        await buyNow (
            {
                id: listingId,
                buyAmount: 1,
                type: listing.type,
            },
            {
                onSuccess(data, variables, context) {
                    toast.dismiss();
                    toast.success("NFT bought successfully!");
                    console.log('SUCCESS', data, variables, context);
                    router.replace('/');
                },
                onError(error, variables, context) {
                    toast.dismiss();
                    toast.error("ERROR: NFT could not be bought");
                    console.log("ERROR", error, variables, context);
                },
            }
        )
    }

    const createBidOrOffer = async () => {
        try {
            if (networkMismatch) {
                switchNetwork && switchNetwork(network);
                return;
            }
            // Driect Listing
            if (listing?.type === ListingType.Direct) {
                if(listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
                    toast.loading("Buyout Price met, buying NFT...");
                    buyNft();
                    return;
                }
                toast.loading("Buyout price not met, making offer...");
                await makeOffer(
                    {
                        listingId,
                        quantity: 1,
                        pricePerToken: bidAmount,
                    },
                    {
                        onSuccess(data, variables, context) {
                            toast.dismiss();
                            toast.success("Offer made successfully!");
                            console.log("SUCCESS", data, variables, context);
                            setBidAmount('')
                        },
                        onError(error, variables, context) {
                            toast.dismiss();
                            toast.error("Offer could not be made");
                            console.log("ERROR", error, variables, context);
                        },
                    }
                );
            }
            // Auction Listing
            if (listing?.type === ListingType.Auction) {
                toast.loading("Making bid...");

                await makeBid(
                    {
                        listingId,
                        bid: bidAmount,
                    },
                    {
                        onSuccess(data, variables, context) {
                            toast.dismiss();
                            toast.success("Bid made successfully!");
                            console.log("SUCCESS",data, variables, context);
                            setBidAmount('')
                        },
                        onError(error, variables, context) {
                            toast.dismiss();
                            toast.error("Bid could not be made");
                            console.log("ERROR", error, variables, context);
                        },
                    }
                )
            }

        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return (
        <div>
            {/* <Header /> */}
            <div>
                <p className='text-center animate-pulse text-blue-500'>
                    Loading Item...
                </p>
            </div>
        </div>
    );

    if (!listing) {
        return <div>Listing not found</div>
    };

    return (
        <div>
            <Toaster 
                position='top-center'
                reverseOrder={false}
            />
            <main className='max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10
                space-x-5 pr-10'
            >
                <div className='p-10 border rounded-lg  mx-auto lg:mx-0 max-w-md lg:max-w-xl'>
                    <MediaRenderer className='rounded-lg' src={listing.asset.image}/>
                </div>

                <section className='flex-1 space-y-5 pb-20 lg:pb-0'>
                    <div>
                        <h1 className='text-xl font-bold dark:text-[#f1f1f1]'>
                            {listing.asset.name}
                        </h1>
                        <p className='text-gray-600'>
                            {listing.asset.description}
                        </p>
                        <p className='flex items-center text-xs sm:text-base dark:text-[#f1f1f1]'>
                            <UserCircleIcon className='h-5' />
                            <span className='font-bold pr-2'>Seller: </span> 
                            {listing.sellerAddress}
                        </p>
                    </div>

                    <div className='grid grid-cols-2 items-center py-2'>
                        <p className='font-bold dark:text-[#f1f1f1]'>
                            Listing Types:
                        </p>
                        <p className='dark:text-[#f1f1f1]'>{listing.type === ListingType.Direct 
                            ? "Direct Listing"
                            : "Auction Listing"}
                        </p>

                        <p className='font-bold dark:text-[#f1f1f1]'>Buy it Now Price:</p>
                        <p className='text-3xl font-bold dark:text-[#f1f1f1]'>
                            {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
                            {listing.buyoutCurrencyValuePerToken.symbol}
                        </p>

                        <button onClick={buyNft}  className='col-start-2 mt-2 bg-blue-600 font-bold text-white
                            rounded-full w-44 py-4 px-10 dark:text-[#f1f1f1]'
                        >
                            Buy Now
                        </button>
                    </div>
                    {/* if DIRECT, show offers here... */}
                    {listing.type === ListingType.Direct && offers && (
                        <div className='grid grid-cols-2 gap-y-2'>
                            <p className='font-bold dark:text-[#f1f1f1]'>Offers: </p>
                            <p className='font-bold dark:text-[#f1f1f1]'>{offers?.length > 0 ? offers?.length : 0}</p>

                            {offers?.map(offer => (
                                <>
                                    <p className='flex items-center ml-5 text-sm italic'>
                                        <UserCircleIcon className='h-3 mr-2'/>
                                        {offer.offeror?.slice(0, 5) +
                                            "..." + 
                                        offer.offeror?.slice(-5)}
                                    </p>
                                    <div>
                                        <p
                                            key={
                                                offer.listingId +
                                                offer.offeror + 
                                                offer.totalOfferAmount.toString()
                                            }
                                            className='text-sm italic dark:text-[#f1f1f1]'
                                        >
                                            {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}{NATIVE_TOKENS[network].symbol}
                                        </p>

                                        {listing.sellerAddress === address && (
                                            <button
                                                onClick={() => {
                                                    toast.loading("Accepting...");
                                                    acceptOffer({
                                                        addressOfOfferor: offer.offeror,
                                                        listingId,
                                                    },{
                                                        onSuccess(data, variables, context) {
                                                            toast.dismiss();
                                                            toast.success("Offer accepted successfully!");
                                                            console.log('SUCCESS', data, variables, context);
                                                            router.replace('/');
                                                        },
                                                        onError(error, variables, context) {
                                                            toast.dismiss();
                                                            toast.error("Offer could not be accepted");
                                                            console.log("ERROR", error, variables, context);
                                                        },
                                                    })
                                                }}
                                                className='p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer dark:text-[#f1f1f1]'
                                            >
                                                Accept Offer
                                            </button>
                                        )}
                                    </div>
                                </>
                            ))}
                        </div>
                    )}


                    <div className='grid grid-cols-2 space-y-2 items-center justify-end'>
                        <hr className='col-span-2' />

                        <p className='col-span-2 font-bold dark:text-[#f1f1f1]'>
                            {listing.type === ListingType.Direct
                                ? "Make an Offer"
                                : "Bid on this Auction"}
                        </p>

                        {/* Remaining time on auction goes here... */}
                        {listing.type === ListingType.Auction && (
                            <>
                                <p>Current Minimum Bid: </p>
                                <p className='font-bold dark:text-[#f1f1f1]'>
                                    {minimumNextBid?.displayValue} {minimumNextBid?.symbol}
                                </p>

                                <p>Time Remaining: </p>
                                <Countdown 
                                    date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                                />
                            </>
                        )}

                        <input 
                            onChange={(e) => setBidAmount(e.target.value)}
                            className='border p-2 rounded-lg mr-5'
                            type="text" 
                            placeholder={formatPlaceholder()} 
                        />
                        <button onClick={createBidOrOffer} className='bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10'>
                            {listing.type === ListingType.Direct
                                ? "Offer"
                                : "Bid"
                            }
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default ListingPage