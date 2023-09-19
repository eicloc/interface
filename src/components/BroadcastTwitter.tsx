import { Box, Button } from 'grommet';
import ClaimStep, { ClaimStatus } from './ClaimStep';
import { useIsMounted } from '../hooks';
import { useState } from 'react';

export default function BroadcastTwitter() {
  const mounted = useIsMounted();

  const [status, setStatus] = useState<ClaimStatus>('active');

  const handleBroadcastButton = () => {
    // open invite modal
  };

  const handleVerifyButton = () => {
    setStatus('complete');
  };

  if (!mounted) {
    return <></>;
  }

  return (
    <ClaimStep
      label="Broadcast your Journey to your mate"
      step={6}
      status={status}
    >
      {status !== 'complete' && (
        <Box direction="row" gap="xsmall">
          <Button
            primary
            label="Broadcast Now"
            onClick={handleBroadcastButton}
            style={{ boxShadow: '3px 4px 0px 0px #000' }}
          />
          <Button
            secondary
            label="Verify"
            onClick={handleVerifyButton}
            style={{ boxShadow: '3px 4px 0px 0px #000' }}
          />
        </Box>
      )}
    </ClaimStep>
  );
}
