import { Box, Button, Heading, Layer, RangeInput, Select, Text, TextInput } from 'grommet';
import { PrimaryButton } from '../PrimaryButton';
import { useState, useContext, useEffect } from 'react';
import { useCreditsData } from '../../hooks/useCreditsData';
import { WalletContext } from '../../context/walletContext';
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { FLOCK_CREDITS_ABI } from '@/src/contracts/flockCredits';
import { FLOCK_ABI } from '@/src/contracts/flock';
import { parseEther } from 'viem';

export const Research = ({
    isResearching,
    task,
    reportType,
    setTask,
    setReportType,
    handleSubmit,
}:{
    isResearching: boolean,
    task: string,
    reportType: { label: string, value: string },
    setTask: (task: string) => void,
    setReportType: (option: { label: string, value: string }) => void,
    handleSubmit: () => void,
}) => {
    const [showPurchase, setShowPurchase] = useState(false);
    const [amount, setAmount] = useState<number>(1);
    const { address } = useAccount();

    const { FLCTokenBalance } = useContext(WalletContext);
    const { userData, researchPrice, isWhitelisted } = useCreditsData({
        userAddress: address,
    });

    const userBalance = userData
        ? Math.round(Number(userData[2]) * 100) / 100
        : 0;
    const price = researchPrice ? Number(researchPrice) : 0;
    const numberOfResearchesAvailable = Math.trunc(userBalance / price);
    const hasAccess = reportType.value === 'outline_report' || numberOfResearchesAvailable > 0

    const {
        data: purchaseCredits,
        write: writePurchaseCredits,
        isLoading: purchaseLoading,
      } = useContractWrite({
        address: process.env.NEXT_PUBLIC_FLOCK_CREDITS_ADDRESS as `0x${string}`,
        abi: FLOCK_CREDITS_ABI,
        functionName: 'addCredits',
      });
    
      const {
        data: approveTokens,
        write: writeApproveTokens,
        isLoading: approveLoading,
      } = useContractWrite({
        address: process.env.NEXT_PUBLIC_FLOCK_TOKEN_ADDRESS as `0x${string}`,
        abi: FLOCK_ABI,
        functionName: 'approve',
      });
    
      const { isSuccess: isSuccessApprove, isLoading: isApproveTxLoading } =
        useWaitForTransaction({
          hash: approveTokens?.hash,
        });
    
      const { isSuccess: isSuccessPurchase, isLoading: isPurchaseTxLoading } =
        useWaitForTransaction({
          hash: purchaseCredits?.hash,
        });
    
    const handleApprove = () => {
        writeApproveTokens?.({
            args: [
            process.env.NEXT_PUBLIC_FLOCK_CREDITS_ADDRESS as `0x${string}`,
            parseEther(`${amount * price}`),
            ],
        });
        };
    
    const handlePurchase = () => {
        writePurchaseCredits?.({ args: [amount * price] });
        };
    
    useEffect(() => {
        if (isSuccessApprove) {
            handlePurchase();
        }
        }, [isSuccessApprove]);
        
    useEffect(() => {
    if (isSuccessPurchase) {
        setShowPurchase(false);
    }
    }, [isSuccessPurchase]);
    

  return (
    <>
        {showPurchase && (
            <Layer>
                <Box pad="large" align="center" gap="small" width="550px">
                    <Heading level="2" margin="xsmall">
                        Purchase Reports
                    </Heading>
                    <Text alignSelf="start" weight="bold">
                        Single research report costs $FLC {price}     
                    </Text>
                    {Number(FLCTokenBalance?.formatted) < price ? (
                        <Text weight="bold" alignSelf="start" color="red">
                            Not enough FLC to purchase credits
                        </Text>
                    ) : (
                        <Box
                            width="100%"
                            direction="row"
                            justify="between"
                            align="center"
                        >
                            <Text weight="bold">Researches</Text>
                            <Box direction="row" gap="small" width="65%">
                            <Text weight="bold">{amount}</Text>
                            <RangeInput
                                size={30}
                                value={amount}
                                min={1}
                                max={Math.trunc(Number(FLCTokenBalance?.formatted) / price)}
                                step={1}
                                onChange={(event) => setAmount(Number(event.target.value))}
                            />
                            </Box>
                        </Box>
                    )}
                    <Box direction="row" justify="between" fill="horizontal">
                        { Number(FLCTokenBalance?.formatted) >= price && (
                            <Button
                                primary
                                busy={
                                    purchaseLoading ||
                                    approveLoading ||
                                    isApproveTxLoading ||
                                    isPurchaseTxLoading
                                }
                                onClick={handleApprove}
                                label="Purchase"
                            />
                        )}
                        <Button
                            margin={{ top: 'medium' }}
                            alignSelf="end"
                            secondary
                            disabled={
                                purchaseLoading ||
                                approveLoading ||
                                isApproveTxLoading ||
                                isPurchaseTxLoading
                            }
                            onClick={() => setShowPurchase(false)}
                            label="Close"
                        />
                    </Box>
                </Box>
            </Layer>
        )}

        <Box
            pad={{ vertical: 'large', horizontal: 'large' }}
            gap="medium"
            fill="horizontal"
        >
            <Box>
                <Box>
                    <Heading level="2" margin="none" weight="bold">Step1: Research & Download Reports</Heading>
                    {reportType.value !== 'outline_report' &&
                        <Text>
                            <span>&#42;</span> You need to pay <b>{price}$FLC</b> for single report. You have <b>{numberOfResearchesAvailable}</b> {numberOfResearchesAvailable > 1 ? 'reports' : 'report'} left.
                        </Text>
                    }
                </Box>
            </Box>
            <Box gap="small">
                <Box>
                <Text>What would you like me to research next?</Text>
                <Box background="white">
                    <TextInput value={task} onChange={(e) => setTask(e.target.value)} />
                </Box>
                </Box>
                <Box>
                    <Text>What type of report would you like me to generate?</Text>
                    <Box background="white">
                        <Select
                            options={[
                            { label: 'Research Report', value: 'research_report' },
                            ]}
                            value={reportType.value}
                            valueLabel={<Box pad="small">{reportType.label}</Box>}
                            onChange={({ option }) => setReportType(option)}
                            disabled={isResearching}
                        />
                    </Box>
                </Box>
            </Box>
            <Box justify="end" align="end">
                <PrimaryButton
                    label={hasAccess ? "Research" : "Pay and research"} 
                    busy={isResearching}
                    onClick={
                        hasAccess
                          ? () => handleSubmit()
                          : () => setShowPurchase(true)
                      }
                    pad={{ vertical: 'small', horizontal: 'large' }}
                    />
            </Box>
        </Box>
    </>
  );
};
