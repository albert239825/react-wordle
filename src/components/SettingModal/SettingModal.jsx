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
      >
        <Switch isOn={isHardMode} onToggle={setIsHardMode} />
      </Row>
      <Row title="Dark Mode">
        <Switch isOn={isDarkMode} onToggle={setIsDarkMode} />
      </Row>
      <Row
        title="Keyboard Layout"
        desc="Change the letter arrangement of the on-screen keyboard (QWERTY, AZERTY, or Colemak)"
      >
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
      </Row>
    </Modal>
  );
};

const Row = ({ title, desc, children }) => {
  return (
    <div className={styles.row}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        <h3 className={styles.desc}>{desc}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default SettingModal;
