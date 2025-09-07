import styled from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerTable } from "./components/CustomerTable";
import { CustomerTableProvider } from "./contexts/CustomerTableContext";
import { media } from "./styles/responsive";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Optimized styled components
const AppContainer = styled.div`
    min-height: 100vh;
    background-color: #f9fafb;
    color: #111827;
    display: flex;
    flex-direction: column;
`;

const Header = styled.header`
    padding: 1rem;
    background-color: #2563eb;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    text-align: center;
    
    ${media.tablet} {
        padding: 0.75rem;
    }
    
    ${media.mobile} {
        padding: 0.75rem 1rem;
    }
`;

const HeaderTitle = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    
    ${media.tablet} {
        font-size: 1.25rem;
    }
    
    ${media.mobile} {
        font-size: 1.125rem;
    }
`;

const Main = styled.main`
    flex: 1;
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    
    ${media.tablet} {
        padding: 1rem;
    }
    
    ${media.mobile} {
        padding: 0.75rem;
    }
`;

const ContentContainer = styled.div`
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Footer = styled.footer`
    padding: 8px 12px;
    background-color: #e5e7eb;
    text-align: center;
    font-size: 0.875rem;
    color: #4b5563;
    
    ${media.tablet} {
        font-size: 0.8rem;
        padding: 0.75rem 1rem;
    }
    
    ${media.mobile} {
        font-size: 0.75rem;
        padding: 0.5rem;
    }
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerTableProvider>
        <AppContainer>
          <Header>
            <HeaderTitle>Customer Data Explorer</HeaderTitle>
          </Header>
            <ContentContainer>
          <Main>
            <CustomerTable />
          </Main>
            </ContentContainer>
          <Footer>
            <p>&copy; 2025 Customer Data Explorer. All rights reserved.</p>
          </Footer>
        </AppContainer>
      </CustomerTableProvider>
    </QueryClientProvider>
  );
}

export default App;
