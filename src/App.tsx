import { Route, Switch } from 'wouter';
import { MainMenu } from './pages/MainMenu';
import { GamePage } from './pages/GamePage';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={MainMenu} />
        <Route path="/game" component={GamePage} />
        <Route>
          <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-white/60">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster theme="dark" />
    </>
  );
}

export default App;
