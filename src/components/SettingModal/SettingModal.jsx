import Modal from 'components/Modal';
import Switch from 'components/Switch';
import { KEYBOARD_LAYOUTS } from 'constants/keyboardLayouts';
import styles from './SettingModal.module.scss';

const SettingModal = ({
  isOpen,
  onClose,
  isHardMode,
  isDarkMode,
  setIsHardMode,
  setIsDarkMode,
  keyboardLayout,
  setKeyboardLayout,
}) => {
  return (
    <Modal title="Setting" isOpen={isOpen} onClose={onClose}>
      <Row
        title="Hard Mode"
        desc="Any revealed hints must be used in subsequent guesses"
        isOn={isHardMode}
        onToggle={setIsHardMode}
      />
      <Row title="Dark Mode" isOn={isDarkMode} onToggle={setIsDarkMode} />
      <div className={styles.row}>
        <div>
          <h2 className={styles.title}>Keyboard Layout</h2>
          <h3 className={styles.desc}>Layout of the on-screen keyboard</h3>
        </div>
        <div>
          <select
            className={styles.select}
            value={keyboardLayout}
            onChange={e => setKeyboardLayout(e.target.value)}
          >
            {Object.entries(KEYBOARD_LAYOUTS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

const Row = ({ title, desc, isOn, onToggle }) => {
  return (
    <div className={styles.row}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        <h3 className={styles.desc}>{desc}</h3>
      </div>
      <div>
        <Switch isOn={isOn} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default SettingModal;
